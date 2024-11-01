import { createSignal, onMount, createEffect, For, Show } from 'solid-js';
import { createEvent, supabase } from './supabaseClient';
import { Auth } from '@supabase/auth-ui-solid';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { SolidMarkdown } from 'solid-markdown';

function App() {
  const [lessons, setLessons] = createSignal([]);
  const [newLesson, setNewLesson] = createSignal({ content: '' });
  const [user, setUser] = createSignal(null);
  const [currentPage, setCurrentPage] = createSignal('login');
  const [loading, setLoading] = createSignal(false);
  const [generatedImage, setGeneratedImage] = createSignal('');
  const [audioUrl, setAudioUrl] = createSignal('');
  const [markdownText, setMarkdownText] = createSignal('');

  const checkUserSignedIn = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      setCurrentPage('homePage');
    }
  };

  onMount(checkUserSignedIn);

  createEffect(() => {
    const authListener = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setUser(session.user);
        setCurrentPage('homePage');
      } else {
        setUser(null);
        setCurrentPage('login');
      }
    });

    return () => {
      authListener.data.unsubscribe();
    };
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage('login');
  };

  const fetchLessons = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch('/api/getLessons', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      setLessons(data);
    } else {
      console.error('Error fetching lessons:', response.statusText);
    }
  };

  const saveLesson = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    try {
      const response = await fetch('/api/saveLesson', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLesson()),
      });
      if (response.ok) {
        const savedLesson = await response.json();
        setLessons([...lessons(), savedLesson]);
        setNewLesson({ content: '' });
      } else {
        console.error('Error saving lesson');
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
    }
  };

  createEffect(() => {
    if (!user()) return;
    fetchLessons();
  });

  const handleGenerateLesson = async () => {
    setLoading(true);
    try {
      const result = await createEvent('chatgpt_request', {
        prompt: 'Create an English lesson for learning basic grammar. Provide the lesson content in markdown format.',
        response_type: 'text'
      });
      setNewLesson({ content: result });
    } catch (error) {
      console.error('Error generating lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    setLoading(true);
    try {
      const result = await createEvent('generate_image', {
        prompt: 'An educational illustration related to English grammar'
      });
      setGeneratedImage(result);
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTextToSpeech = async () => {
    setLoading(true);
    try {
      const result = await createEvent('text_to_speech', {
        text: newLesson().content
      });
      setAudioUrl(result);
    } catch (error) {
      console.error('Error converting text to speech:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkdownGeneration = async () => {
    setLoading(true);
    try {
      const result = await createEvent('chatgpt_request', {
        prompt: 'Create detailed notes on English grammar in markdown format',
        response_type: 'text'
      });
      setMarkdownText(result);
    } catch (error) {
      console.error('Error generating markdown notes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-4 text-gray-800">
      <Show
        when={currentPage() === 'homePage'}
        fallback={
          <div class="flex items-center justify-center min-h-screen">
            <div class="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
              <h2 class="text-3xl font-bold mb-6 text-green-600">Sign in with ZAPT</h2>
              <a
                href="https://www.zapt.ai"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-500 hover:underline mb-6 block text-center"
              >
                Learn more about ZAPT
              </a>
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={['google', 'facebook', 'apple']}
                magicLink={true}
                view="magic_link"
                showLinks={false}
                authView="magic_link"
              />
            </div>
          </div>
        }
      >
        <div class="max-w-6xl mx-auto">
          <div class="flex justify-between items-center mb-8">
            <h1 class="text-4xl font-bold text-green-600">English Learning Hub</h1>
            <button
              class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div class="col-span-1 md:col-span-2 lg:col-span-2">
              <h2 class="text-2xl font-bold mb-4 text-green-600">Generate New Lesson</h2>
              <div class="space-y-4">
                <button
                  class={`w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${loading() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleGenerateLesson}
                  disabled={loading()}
                >
                  <Show when={loading()}>Generating Lesson...</Show>
                  <Show when={!loading()}>Generate Lesson</Show>
                </button>
                <Show when={newLesson().content}>
                  <div class="bg-white p-6 rounded-lg shadow-md">
                    <SolidMarkdown children={newLesson().content} />
                    <div class="flex space-x-4 mt-4">
                      <button
                        class="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
                        onClick={saveLesson}
                      >
                        Save Lesson
                      </button>
                      <button
                        class="flex-1 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
                        onClick={handleTextToSpeech}
                        disabled={loading()}
                      >
                        <Show when={loading()}>Generating Audio...</Show>
                        <Show when={!loading()}>Text to Speech</Show>
                      </button>
                    </div>
                  </div>
                </Show>
              </div>
            </div>

            <div class="col-span-1 md:col-span-2 lg:col-span-1">
              <h2 class="text-2xl font-bold mb-4 text-green-600">Saved Lessons</h2>
              <div class="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-4">
                <For each={lessons()}>
                  {(lesson) => (
                    <div class="bg-white p-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                      <SolidMarkdown children={lesson.content} />
                      <button
                        class="mt-4 w-full px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
                        onClick={() => {
                          setNewLesson({ content: lesson.content });
                        }}
                      >
                        View Lesson
                      </button>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </div>

          <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <Show when={generatedImage()}>
              <div>
                <h3 class="text-xl font-bold mb-2 text-green-600">Generated Image</h3>
                <img src={generatedImage()} alt="Generated image" class="w-full rounded-lg shadow-md" />
              </div>
            </Show>
            <Show when={audioUrl()}>
              <div>
                <h3 class="text-xl font-bold mb-2 text-green-600">Lesson Audio</h3>
                <audio controls src={audioUrl()} class="w-full" />
              </div>
            </Show>
            <Show when={markdownText()}>
              <div>
                <h3 class="text-xl font-bold mb-2 text-green-600">Markdown Notes</h3>
                <div class="bg-white p-4 rounded-lg shadow-md">
                  <SolidMarkdown children={markdownText()} />
                </div>
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  );
}

export default App;
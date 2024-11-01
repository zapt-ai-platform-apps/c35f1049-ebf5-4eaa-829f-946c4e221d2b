import { useParams, Link } from '@solidjs/router';
import lessons from '../data/lessons';
import { createMemo, Show } from 'solid-js';

function LessonDetail() {
  const params = useParams();
  const lesson = createMemo(() => lessons.find((l) => l.id === params.id));

  return (
    <div class="bg-white p-6 rounded-lg shadow-md">
      <Link href="/" class="text-blue-500 hover:underline">&larr; Back to lessons</Link>
      <Show when={lesson()} fallback={<p>Loading...</p>}>
        <h2 class="text-2xl font-bold text-purple-600 mb-4">{lesson().title}</h2>
        <p class="text-gray-700 whitespace-pre-wrap">{lesson().content}</p>
      </Show>
    </div>
  );
}

export default LessonDetail;
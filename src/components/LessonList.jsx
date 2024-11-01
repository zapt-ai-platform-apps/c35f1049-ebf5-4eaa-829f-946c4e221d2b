import { For } from 'solid-js';
import { Link } from '@solidjs/router';
import lessons from '../data/lessons';

function LessonList() {
  return (
    <div class="space-y-4">
      <For each={lessons}>
        {(lesson) => (
          <Link href={`/lesson/${lesson.id}`} class="block bg-white p-6 rounded-lg shadow-md hover:bg-gray-100 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer">
            <h2 class="text-2xl font-bold text-purple-600 mb-2">{lesson.title}</h2>
            <p class="text-gray-700">Click to read more...</p>
          </Link>
        )}
      </For>
    </div>
  );
}

export default LessonList;
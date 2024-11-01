import { Routes, Route } from '@solidjs/router';

import LessonList from './components/LessonList';
import LessonDetail from './components/LessonDetail';

function App() {
  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4">
      <div class="max-w-6xl mx-auto">
        <h1 class="text-4xl font-bold text-purple-600 mb-8 text-center">Learn English with New App</h1>
        <Routes>
          <Route path="/" component={LessonList} />
          <Route path="/lesson/:id" component={LessonDetail} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
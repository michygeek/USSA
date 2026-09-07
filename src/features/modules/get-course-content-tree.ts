import { listModulesByCourse } from './module-queries';
import { listLessonsByModule } from '@/features/lessons/lesson-queries';

export async function getCourseContentTree(courseId: string) {
  const moduleList = await listModulesByCourse(courseId);
  return Promise.all(
    moduleList.map(async (moduleRecord) => ({
      moduleRecord,
      moduleLessons: await listLessonsByModule(moduleRecord.id),
    })),
  );
}

import { db } from '../db/index.js';
import { eq } from 'drizzle-orm';
import { courses, researchReports } from '../db/schema/index.js';

/**
 * Generate a URL-friendly slug from a title
 * @param title - The title to convert to a slug
 * @returns A URL-friendly slug
 * @example generateSlug("My Course Title!") // "my-course-title"
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Replace non-word characters (except spaces/hyphens) with empty string
    .replace(/[^\w\s-]/g, '')
    // Replace spaces and underscores with single hyphen
    .replace(/[\s_]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Create a unique slug by appending a counter if necessary
 * @param baseSlug - The base slug to make unique
 * @param tableName - The table to check for uniqueness
 * @returns A unique slug
 */
export async function createUniqueSlug(
  baseSlug: string,
  tableName: 'courses' | 'researchReports'
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    let existing: unknown;

    switch (tableName) {
      case 'courses':
        existing = await db.query.courses.findFirst({
          where: eq(courses.slug, slug),
        });
        break;
      case 'researchReports':
        existing = await db.query.researchReports.findFirst({
          where: eq(researchReports.slug, slug),
        });
        break;
    }

    if (!existing) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

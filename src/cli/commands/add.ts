import { Command } from 'commander';
import { addBookmark } from '../../store/bookmarkStore';
import { commitBookmarkChanges } from '../../sync';

export interface AddOptions {
  tags?: string;
  title?: string;
  sync?: boolean;
}

export async function addCommand(
  url: string,
  options: AddOptions
): Promise<void> {
  const tags = options.tags
    ? options.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  const title = options.title ?? url;

  try {
    const bookmark = await addBookmark({ url, title, tags });
    console.log(`✅ Bookmark added: [${bookmark.id}] ${bookmark.title}`);
    console.log(`   URL  : ${bookmark.url}`);
    if (tags.length > 0) {
      console.log(`   Tags : ${tags.join(', ')}`);
    }

    if (options.sync) {
      console.log('🔄 Syncing...');
      await commitBookmarkChanges(`add bookmark: ${bookmark.title}`);
      console.log('✅ Synced successfully.');
    }
  } catch (err) {
    console.error('❌ Failed to add bookmark:', (err as Error).message);
    process.exit(1);
  }
}

export function registerAddCommand(program: Command): void {
  program
    .command('add <url>')
    .description('Add a new bookmark')
    .option('-t, --title <title>', 'Title for the bookmark')
    .option(
      '--tags <tags>',
      'Comma-separated list of tags (e.g. "dev,tools")'
    )
    .option('-s, --sync', 'Commit and push changes after adding', false)
    .action(addCommand);
}

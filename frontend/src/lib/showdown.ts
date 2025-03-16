import Showdown from 'showdown';

export const showdown = new Showdown.Converter({
  emoji: true,
  tables: true,
  strikethrough: true,
  simpleLineBreaks: true,
  tasklists: true
});

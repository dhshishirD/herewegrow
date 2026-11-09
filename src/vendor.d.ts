declare module 'mammoth/mammoth.browser.min.js';
declare module 'virtual:blog-posts' {
  import type { Post } from '../shared/blogParse';
  const posts: Post[];
  export default posts;
}

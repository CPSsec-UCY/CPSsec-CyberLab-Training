import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export const mdxOptions: MDXRemoteProps["options"] = {
  // Course MDX is trusted, version-controlled source and intentionally uses JSX expressions.
  blockJS: false,
  mdxOptions: {
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [rehypeKatex],
  },
};

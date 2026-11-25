import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxOptions } from "@/lib/mdx";
import { mdxComponents } from "@/components/mdx";
import { getAdjacentModules, getModule, getModuleSlugs } from "@/lib/modules";
import { getCitations } from "@/lib/citations";
import { ModuleHeader } from "@/components/modules/ModuleHeader";
import { ModuleNav } from "@/components/modules/ModuleNav";
import { ModuleReferences } from "@/components/citations/ModuleReferences";
import { CourseOverview } from "@/components/course/CourseOverview";
import { DepthLensProvider } from "@/components/depth/DepthLensProvider";
import { DepthLensSwitcher } from "@/components/depth/DepthLensSwitcher";

export const dynamicParams = false;

export function generateStaticParams() {
  return getModuleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const learningModule = getModule(slug);
  if (!learningModule) return { title: "Module not found" };
  return {
    title: learningModule.title,
    description: learningModule.summary,
    openGraph: {
      title: learningModule.title,
      description: learningModule.summary,
    },
  };
}

export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const learningModule = getModule(slug);
  if (!learningModule) notFound();

  const { prev, next } = getAdjacentModules(learningModule.slug);
  const citations = getCitations(learningModule.citations);

  return (
    <article>
      <ModuleHeader module={learningModule} citationCount={citations.length} />

      <CourseOverview module={learningModule} />
      <div className="container-page py-6">
        <DepthLensProvider>
          <DepthLensSwitcher />
          <div className="mx-auto mt-6 max-w-4xl">
            <MDXRemote source={learningModule.content} components={mdxComponents} options={mdxOptions} />
          </div>
        </DepthLensProvider>

        <div className="mx-auto max-w-4xl">
          <ModuleReferences ids={learningModule.citations} />
          <ModuleNav prev={prev} next={next} />
        </div>
      </div>
    </article>
  );
}

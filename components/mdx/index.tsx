import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { Lens } from "@/components/depth/Lens";
import { Cite } from "@/components/citations/Cite";
import { Callout } from "@/components/ui/Callout";
import { Figure } from "@/components/ui/Figure";
import { KnowledgeCheck } from "@/components/learning/KnowledgeCheck";
import { MlKemCorrectness } from "@/components/visualizers/MlKemCorrectness";
import { FoTransform } from "@/components/visualizers/FoTransform";
import { RejectionSampling } from "@/components/visualizers/RejectionSampling";
import { NttButterfly } from "@/components/visualizers/NttButterfly";
import { QuantumThreat } from "@/components/visualizers/QuantumThreat";
import { SideChannelLeak } from "@/components/visualizers/SideChannelLeak";
import { ParameterExplorer } from "@/components/visualizers/ParameterExplorer";
import { TlsHandshake } from "@/components/visualizers/TlsHandshake";

function MdxLink({ href = "", children, ...props }: ComponentPropsWithoutRef<"a">) {
  if (href.startsWith("/")) {
    return <Link href={href}>{children}</Link>;
  }
  const external = href.startsWith("http");
  return (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} {...props}>
      {children}
    </a>
  );
}

export const mdxComponents = {
  Lens,
  Cite,
  Callout,
  Figure,
  KnowledgeCheck,
  MlKemCorrectness,
  FoTransform,
  RejectionSampling,
  NttButterfly,
  QuantumThreat,
  SideChannelLeak,
  ParameterExplorer,
  TlsHandshake,
  a: MdxLink,
};

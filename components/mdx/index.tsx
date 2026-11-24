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
import { AeadDemo } from "@/components/visualizers/AeadDemo";
import { HashAvalanche } from "@/components/visualizers/HashAvalanche";
import { CentralisationSpectrum } from "@/components/visualizers/CentralisationSpectrum";
import { FederatedLearningDemo } from "@/components/visualizers/FederatedLearningDemo";
import { DpiPipeline } from "@/components/visualizers/DpiPipeline";
import { SocTriage } from "@/components/visualizers/SocTriage";
import { ZkSchnorrDemo } from "@/components/visualizers/ZkSchnorrDemo";
import { KemVsSignature } from "@/components/illustrations/KemVsSignature";
import { KeyHierarchy } from "@/components/illustrations/KeyHierarchy";
import { HmacHkdfFlow } from "@/components/illustrations/HmacHkdfFlow";
import { ByzantineQuorum } from "@/components/illustrations/ByzantineQuorum";
import { SocLifecycle } from "@/components/illustrations/SocLifecycle";
import { PkiChain } from "@/components/illustrations/PkiChain";
import { MpcSharing } from "@/components/illustrations/MpcSharing";
import { SlhHypertree } from "@/components/illustrations/SlhHypertree";
import { MlKemFlow } from "@/components/illustrations/MlKemFlow";
import { MlDsaFlow } from "@/components/illustrations/MlDsaFlow";
import { MaskingDiagram } from "@/components/illustrations/MaskingDiagram";
import { QuantumTimeline } from "@/components/illustrations/QuantumTimeline";
import { NttWork } from "@/components/illustrations/NttWork";
import { DpiVisibility } from "@/components/illustrations/DpiVisibility";
import { FederatedThreatMatrix } from "@/components/illustrations/FederatedThreatMatrix";
import { GuidedWorkshop } from "@/components/course/GuidedWorkshop";
import { WorkedExample } from "@/components/course/WorkedExample";
import { ProcessFlow } from "@/components/course/ProcessFlow";
import { QuantumAttackLab } from "@/components/visualizers/QuantumAttackLab";
import { KemProtocolLab } from "@/components/visualizers/KemProtocolLab";
import { NonceReuseLab } from "@/components/visualizers/NonceReuseLab";
import { HmacHkdfLab } from "@/components/visualizers/HmacHkdfLab";
import { ConsensusRoundLab } from "@/components/visualizers/ConsensusRoundLab";
import { DifferentialPrivacyLab } from "@/components/visualizers/DifferentialPrivacyLab";
import { PacketReassemblyLab } from "@/components/visualizers/PacketReassemblyLab";
import { DetectionQueryLab } from "@/components/visualizers/DetectionQueryLab";
import { HybridCombinerLab } from "@/components/visualizers/HybridCombinerLab";
import { MpcSecretSharingLab } from "@/components/visualizers/MpcSecretSharingLab";
import { PolynomialConvolutionLab } from "@/components/visualizers/PolynomialConvolutionLab";
import { MlKemNoiseBudgetLab } from "@/components/visualizers/MlKemNoiseBudgetLab";
import { MlDsaHintLab } from "@/components/visualizers/MlDsaHintLab";
import { WotsChainLab } from "@/components/visualizers/WotsChainLab";
import { PowerTraceLab } from "@/components/visualizers/PowerTraceLab";
import { WebSecurityLab } from "@/components/visualizers/WebSecurityLab";
import { IdentityFlowLab } from "@/components/visualizers/IdentityFlowLab";
import { CloudAttackPathLab } from "@/components/visualizers/CloudAttackPathLab";
import { MalwareTriageLab } from "@/components/visualizers/MalwareTriageLab";
import { SupplyChainLab } from "@/components/visualizers/SupplyChainLab";
import { RedTeamRangeLab } from "@/components/visualizers/RedTeamRangeLab";
import { WebExploitToolingLab } from "@/components/visualizers/WebExploitToolingLab";
import { MalwareReverseLab } from "@/components/visualizers/MalwareReverseLab";
import { RootkitBootkitLab } from "@/components/visualizers/RootkitBootkitLab";
import { DfirTimelineLab } from "@/components/visualizers/DfirTimelineLab";
import { BlueTeamHuntLab } from "@/components/visualizers/BlueTeamHuntLab";
import { TerminalLab } from "@/components/lab/TerminalLab";
import { MdxTable } from "@/components/mdx/Table";

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
  AeadDemo,
  HashAvalanche,
  CentralisationSpectrum,
  FederatedLearningDemo,
  DpiPipeline,
  SocTriage,
  ZkSchnorrDemo,
  KemVsSignature,
  KeyHierarchy,
  HmacHkdfFlow,
  ByzantineQuorum,
  SocLifecycle,
  PkiChain,
  MpcSharing,
  SlhHypertree,
  MlKemFlow,
  MlDsaFlow,
  MaskingDiagram,
  QuantumTimeline,
  NttWork,
  DpiVisibility,
  FederatedThreatMatrix,
  GuidedWorkshop,
  WorkedExample,
  ProcessFlow,
  QuantumAttackLab,
  KemProtocolLab,
  NonceReuseLab,
  HmacHkdfLab,
  ConsensusRoundLab,
  DifferentialPrivacyLab,
  PacketReassemblyLab,
  DetectionQueryLab,
  HybridCombinerLab,
  MpcSecretSharingLab,
  PolynomialConvolutionLab,
  MlKemNoiseBudgetLab,
  MlDsaHintLab,
  WotsChainLab,
  PowerTraceLab,
  WebSecurityLab,
  IdentityFlowLab,
  CloudAttackPathLab,
  MalwareTriageLab,
  SupplyChainLab,
  RedTeamRangeLab,
  WebExploitToolingLab,
  MalwareReverseLab,
  RootkitBootkitLab,
  DfirTimelineLab,
  BlueTeamHuntLab,
  TerminalLab,
  table: MdxTable,
  a: MdxLink,
};

export type MatterState = "intake" | "follow_up";

export type Matter = {
  matterId: string;
  signedDocumentDelivered: boolean;
  deadline: string | null;
};

export function nextMatterState(matter: Matter, today: string): MatterState {
  if (matter.signedDocumentDelivered && matter.deadline !== null && matter.deadline <= today) {
    return "follow_up";
  }
  return "intake";
}

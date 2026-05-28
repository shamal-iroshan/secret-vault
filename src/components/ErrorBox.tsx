type Props = {
  text: string;
};

export function ErrorBox({ text }: Readonly<Props>) {
  return (
    <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
      {text}
    </div>
  );
}

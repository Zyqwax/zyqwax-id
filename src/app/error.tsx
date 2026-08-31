"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="">
      <p className="">Bir aksaklık oldu</p>
      <h1>
        Tekrar
        <br />
        <em>deneyelim.</em>
      </h1>
      <button className="" onClick={reset}>
        Yeniden dene
      </button>
    </main>
  );
}

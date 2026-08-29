'use client';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <main className="page-shell error-page"><p className="eyebrow">Bir aksaklık oldu</p><h1>Tekrar<br /><em>deneyelim.</em></h1><button className="button button-primary" onClick={reset}>Yeniden dene</button></main>; }

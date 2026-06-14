import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get('title') || 'Din Muhammad Rezwoan').slice(0, 100);
  const subtitle = (searchParams.get('subtitle') || 'Full Stack Developer').slice(0, 140);

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0B0B0F',
          backgroundImage:
            'radial-gradient(circle at 78% 12%, rgba(124,108,255,0.35), transparent 45%), radial-gradient(circle at 12% 90%, rgba(34,211,238,0.18), transparent 40%)',
          padding: 72,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#7C6CFF', fontSize: 30, fontWeight: 700 }}>
          <div style={{ width: 14, height: 14, borderRadius: 99, background: '#7C6CFF' }} />
          rezwoan.me
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#ECECEF', fontSize: 68, fontWeight: 800, lineHeight: 1.05, maxWidth: 1000 }}>{title}</div>
          <div style={{ color: '#A2A2AE', fontSize: 32, marginTop: 20, maxWidth: 900 }}>{subtitle}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

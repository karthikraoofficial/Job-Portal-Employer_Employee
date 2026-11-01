import { ImageResponse } from 'next/og';

// The link-preview card for every page that doesn't set its own. Static, so
// it is rendered once at build time and needs no database.

export const alt = "Karthik Rao's Job Portal: find jobs, apply and track every application";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#f1f3f5',
          padding: 48,
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: '#ffffff',
            border: '4px solid #0b0b0c',
            padding: '56px 64px',
          }}
        >
          <div style={{ fontSize: 28, letterSpacing: 4, color: '#6a7078', textTransform: 'uppercase' }}>
            Job Portal
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', fontSize: 76, fontWeight: 700, color: '#0b0b0c', marginTop: 20, lineHeight: 1.05 }}>
            <span>Welcome to&nbsp;</span>
            <span style={{ color: '#ea580c' }}>Karthik Rao&rsquo;s Job Portal</span>
          </div>
          <div style={{ fontSize: 34, color: '#3b3f45', marginTop: 28 }}>
            Browse, apply, and track your progress with ease.
          </div>
        </div>
        <div style={{ display: 'flex', background: '#0b0b0c', color: '#ffffff', fontSize: 24, padding: '14px 24px', letterSpacing: 3 }}>
          JOBS · APPLICATIONS · EMPLOYERS
        </div>
      </div>
    ),
    size
  );
}

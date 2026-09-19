import { Badge, Card, Icon, Ltr, Progress } from '../components/ui'

export default function ClientApp() {
  return (
    <div className="mobile client">
      <div className="hero client">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ font: '800 24px var(--font-ui)' }}>שלום שרה</div>
            <div style={{ font: '600 16px var(--font-ui)', color: 'var(--on-brand-2)' }}>יום שלישי, 15 בספטמבר</div>
          </div>
          <img src="/brand/logo-white.png" height={40} alt="Family Care — always with you" />
        </div>
        <div className="inset-dark" style={{ borderRadius: 14, padding: 15 }}>
          <div style={{ font: '600 15px var(--font-ui)', color: 'var(--on-brand-2)' }}>היום ב-9:30</div>
          <div style={{ font: '800 21px/1.35 var(--font-ui)', margin: '4px 0' }}>נועה מגיעה לקחת אותך לד"ר אבידן</div>
          <div style={{ font: '600 16px var(--font-ui)', color: 'var(--on-brand-3)' }}>המונית תחכה למטה ב-9:20</div>
        </div>
      </div>

      <div className="grid cols-2" style={{ gap: 12 }}>
        <button className="card interactive" style={{ minHeight: 112, borderRadius: 18, background: 'var(--brand-action)', color: '#fff', borderColor: 'var(--brand-action)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', font: '800 19px var(--font-ui)', textAlign: 'start' }}>
          <Icon name="message" size={26} />בקשה חדשה
        </button>
        <button className="card interactive" style={{ minHeight: 112, borderRadius: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', font: '800 19px var(--font-ui)', color: 'var(--ink-1)', textAlign: 'start' }}>
          <Icon name="bell" size={26} />להתקשר לרונית
        </button>
      </div>

      <Card size="lg">
        <div style={{ font: '800 19px var(--font-ui)', marginBottom: 10 }}>התוכנית שלי לחודש ספטמבר</div>
        {[['שלישי', 'ביקור של נועה — ליווי לרופא'], ['חמישי', 'קניות במעדנייה וסידור הבית'], ['שישי', 'חלה, עיתון ופרחים — הטבת המסלול'], ['22.9', 'קונצרט בהיכל התרבות עם חנה']].map(([d, t]) => (
          <div key={d} className="row" style={{ alignItems: 'flex-start', gap: 8, padding: '8px 0' }}>
            <span className="num" style={{ width: 52, fontWeight: 700, fontSize: 16, color: 'var(--brand-link)' }}>{d}</span>
            <span style={{ font: '600 17px/1.45 var(--font-ui)' }}>{t}</span>
          </div>
        ))}
      </Card>

      <Card size="lg">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ font: '800 19px var(--font-ui)' }}>המסלול והזכויות שלי</div><Badge tone="green">פלטינום</Badge>
        </div>
        <div className="row" style={{ justifyContent: 'space-between', font: '600 16px var(--font-ui)', marginBottom: 6 }}>
          <span>מפגשים החודש</span><Ltr style={{ fontWeight: 800 }}>5 / 8</Ltr>
        </div>
        <Progress pct={62} thick />
        <ul style={{ margin: '12px 0 0', paddingInlineStart: 20, font: '600 16px/1.5 var(--font-ui)' }}>
          {['ביקור שישי חודשי — חלה, עיתון ופרחים', 'מפגשי בוקר עם קפה ומאפה', 'מונית VIP או רכב יוקרה לבילויים', 'נציגה קבועה — נועה ש.'].map((b) => <li key={b}>{b}</li>)}
        </ul>
      </Card>

      <Card size="lg">
        <div style={{ font: '800 19px var(--font-ui)', marginBottom: 10 }}>סיכומי הביקורים שלי</div>
        <div className="stack" style={{ gap: 10 }}>
          <div className="item-box" style={{ padding: 14, borderRadius: 14, font: '600 16px/1.45 var(--font-ui)' }}>
            <div style={{ fontWeight: 800 }}>חמישי 11.9 · דניאל</div>
            <div>ליווי לרופא ואיסוף מרשמים. הכול עבר בשלום.</div>
            <div className="row" style={{ gap: 8, marginTop: 8 }}>
              <div style={{ width: 62, height: 50, borderRadius: 10, background: 'var(--inert)' }} /><div style={{ width: 62, height: 50, borderRadius: 10, background: 'var(--inert)' }} />
            </div>
          </div>
          <div className="item-box" style={{ padding: 14, borderRadius: 14, font: '600 16px/1.45 var(--font-ui)' }}>
            <div style={{ fontWeight: 800 }}>שני 8.9 · נועה</div>
            <div>בית קפה בכיכר, סידור דואר ותשלום ארנונה.</div>
          </div>
        </div>
      </Card>

      <div style={{ background: 'var(--tint)', borderRadius: 18, padding: 18, font: '600 17px/1.5 var(--font-ui)', color: 'var(--brand-deep)' }}>
        רוצה משהו? אפשר גם להקליט הודעה במקום להקליד — אנחנו נחזור אליך תוך שעה.
      </div>
    </div>
  )
}

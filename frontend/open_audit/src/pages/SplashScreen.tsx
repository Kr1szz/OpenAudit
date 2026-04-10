import type { Screen } from '../types/index.ts';
function SplashScreen({ onNav }: { onNav: (s: Screen) => void }) {
    return (
      <div className="screen">
        <div className="mesh-bg" />
        <div className="splash-screen">
          <div className="splash-logo">Open <span>Audit</span></div>
          <div className="splash-sub">Personal Finance & Tax Intelligence</div>
          <div className="splash-btns">
            <button className="splash-btn-primary" onClick={() => onNav("login")}>Login</button>
            <button className="splash-btn-ghost" onClick={() => onNav("register")}>Register</button>
          </div>
        </div>
      </div>
    );
}
export default SplashScreen;
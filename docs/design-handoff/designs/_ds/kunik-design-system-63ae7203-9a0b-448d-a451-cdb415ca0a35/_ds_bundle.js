/* @ds-bundle: {"format":4,"namespace":"KunikDesignSystem_63ae72","components":[{"name":"ICON_PATHS","sourcePath":"components/brand/Icon.jsx"},{"name":"Icon","sourcePath":"components/brand/Icon.jsx"},{"name":"Logo","sourcePath":"components/brand/Logo.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Callout","sourcePath":"components/core/Callout.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"LevelPill","sourcePath":"components/core/LevelPill.jsx"},{"name":"SectionLabel","sourcePath":"components/core/SectionLabel.jsx"},{"name":"StatCard","sourcePath":"components/core/StatCard.jsx"},{"name":"DataTable","sourcePath":"components/data/DataTable.jsx"},{"name":"DateChip","sourcePath":"components/data/DateChip.jsx"},{"name":"DomainCard","sourcePath":"components/data/DomainCard.jsx"},{"name":"ListRow","sourcePath":"components/data/ListRow.jsx"},{"name":"EmptyState","sourcePath":"components/feedback/EmptyState.jsx"},{"name":"SyncStatus","sourcePath":"components/feedback/SyncStatus.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"SelectField","sourcePath":"components/forms/SelectField.jsx"},{"name":"TextField","sourcePath":"components/forms/TextField.jsx"},{"name":"AppHeader","sourcePath":"components/navigation/AppHeader.jsx"},{"name":"HomeFab","sourcePath":"components/navigation/HomeFab.jsx"},{"name":"SidebarNav","sourcePath":"components/navigation/SidebarNav.jsx"}],"sourceHashes":{"components/brand/Icon.jsx":"633f911e00f2","components/brand/Logo.jsx":"fc2f60915f0d","components/core/Badge.jsx":"670f57f86893","components/core/Button.jsx":"3fd7f6c14abe","components/core/Callout.jsx":"d36189f2bca6","components/core/Card.jsx":"d25a4fa5f296","components/core/IconButton.jsx":"f8b3e9129dd3","components/core/LevelPill.jsx":"6084d282cc97","components/core/SectionLabel.jsx":"78c1565e5a20","components/core/StatCard.jsx":"a48dd7aed423","components/data/DataTable.jsx":"c4c1b34ffa06","components/data/DateChip.jsx":"dd039ef82ffc","components/data/DomainCard.jsx":"34ef361a0e88","components/data/ListRow.jsx":"27b72213e7f1","components/feedback/EmptyState.jsx":"8440ab0679d5","components/feedback/SyncStatus.jsx":"82bd3e4bbcb3","components/forms/Checkbox.jsx":"8d6409fcee30","components/forms/SelectField.jsx":"8f4529281641","components/forms/TextField.jsx":"2c7b56caee52","components/navigation/AppHeader.jsx":"478260230fe0","components/navigation/HomeFab.jsx":"b680abd2af7b","components/navigation/SidebarNav.jsx":"62e104c63234","ui_kits/kunik-home/DomainView.jsx":"f5859be82e85","ui_kits/kunik-home/Overview.jsx":"b80397d4a444","ui_kits/kunik-home/RecordForm.jsx":"a7ccec17bc91","ui_kits/kunik-home/data.js":"11898222d1a8","ui_kits/tech-eye-level/BusinessApp.jsx":"f3f40a56aa2d","ui_kits/tech-eye-level/HomeHub.jsx":"d4aad6f0317b","ui_kits/tech-eye-level/PrintDocs.jsx":"0263c3652a70","ui_kits/tech-eye-level/TeachingToolkit.jsx":"cbd324224e92"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.KunikDesignSystem_63ae72 = window.KunikDesignSystem_63ae72 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Exact path data from the source project's inline SVGs (24x24, round caps/joins).
const ICON_PATHS = {
  home: ['M4 11l8-6.5 8 6.5V20H4z', 2],
  export: ['M12 3v12M7.5 10.5L12 15l4.5-4.5M4 19h16', 1.8],
  import: ['M12 16V4M7.5 8.5L12 4l4.5 4.5M4 19h16', 1.8],
  plus: ['M12 5v14M5 12h14', 2.2],
  edit: ['M4 20l.8-3.6L15.6 5.6a1.5 1.5 0 0 1 2.1 0l.7.7a1.5 1.5 0 0 1 0 2.1L7.6 19.2 4 20z', 1.8],
  trash: ['M4 7h16M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7M6 7l1 13h10l1-13', 1.8],
  message: ['M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', 1.9],
  close: ['M6 6l12 12M18 6L6 18', 2],
  check: ['M4 12.5l5 5L20 6.5', 2.2],
  'check-bold': ['M20 6L9 17l-5-5', 2.2],
  'chevron-left': ['M14 6l-6 6 6 6', 2.2],
  'chevron-right': ['M10 6l6 6-6 6', 2.1],
  'chevron-down': ['M6 9.5l6 6 6-6', 2.2],
  'arrow-left': ['M5 12h14M13 6l6 6-6 6', 2.2],
  shield: ['M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z', 1.8],
  bars: ['M4 20V10M10 20V4M16 20v-7M3 20h18', 1.8],
  heart: ['M12 21s-7.5-4.6-10-9C.3 8 2 4 6 4c2.2 0 3.7 1.3 6 3.7C14.3 5.3 15.8 4 18 4c4 0 5.7 4 4 8-2.5 4.4-10 9-10 9z', 1.8],
  car: ['M5 16v-3.2L6.6 8A2 2 0 0 1 8.5 6.7h7A2 2 0 0 1 17.4 8L19 12.8V16M5 16h14M5 16v2H7v-2M17 16v2h2v-2M8 12.5h8', 1.8],
  document: ['M6 3h7l5 5v13H6zM13 3v5h5', 1.8],
  bell: ['M12 3a5 5 0 0 0-5 5v3c0 1.2-.5 2.3-1.4 3.1L4 16h16l-1.6-1.9C17.5 13.3 17 12.2 17 11V8a5 5 0 0 0-5-5zM9.5 19a2.5 2.5 0 0 0 5 0', 1.8],
  'trending-up': ['M3 16l6-6 4 4 8-8M15 6h6v6', 1.8],
  smartphone: ['M11 18.5h2', 1.6],
  computer: ['M2 19.5h20', 1.6],
  video: ['M16.5 11l5-3v8l-5-3z', 1.6],
  image: ['M3 5h18v14H3zM7 13l3-3 4 4 3-2', 1.9],
  eye: ['M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z', 1.9],
  materials: ['M9 6V4.5h6V6', 1.9],
  lightbulb: ['M9 18h6M10 21h4M12 3a6 6 0 013.5 10.9V16h-7v-2.1A6 6 0 0112 3z', 1.8],
  warning: ['M12 4l9 16H3zM12 10v4M12 17h.01', 1.9],
  book: ['M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z', 1.9],
  toolkit: ['M4 4h7v16H4zM13 4h7v16h-7z', 1.9],
  printer: ['M7 8V3h10v5M7 18H4v-6h16v6h-3M7 14h10v7H7z', 1.9],
  calendar: ['M4 5h16v15H4zM4 10h16M8 3v4M16 3v4', 1.9],
  flier: ['M4 3h16v18H4zM8 8h8M8 13h8M8 17h5', 1.9],
  slides: ['M12 16v4M9 20h6', 1.9],
  sparkles: ['M12 3l1.7 4.8L18.5 9.5l-4.8 1.7L12 16l-1.7-4.8L5.5 9.5l4.8-1.7zM18 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z', 1.6],
  target: ['', 1.9]
};
const EXTRA = {
  smartphone: /*#__PURE__*/React.createElement("rect", {
    x: "7",
    y: "2.5",
    width: "10",
    height: "19",
    rx: "2.5"
  }),
  computer: /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "4.5",
    width: "18",
    height: "12",
    rx: "1.5"
  }),
  video: /*#__PURE__*/React.createElement("rect", {
    x: "2.5",
    y: "6.5",
    width: "12",
    height: "11",
    rx: "2"
  }),
  image: /*#__PURE__*/React.createElement("circle", {
    cx: "8.5",
    cy: "8.5",
    r: "1.2"
  }),
  eye: /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "3"
  }),
  materials: /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "6",
    width: "18",
    height: "13",
    rx: "2"
  }),
  target: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "8.5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "3.5"
  })),
  slides: /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "4",
    width: "18",
    height: "12",
    rx: "1.5"
  })
};
const WHATSAPP = 'M12 2a10 10 0 00-8.7 15L2 22l5.2-1.3A10 10 0 1012 2zm0 2a8 8 0 11-4.2 14.8l-.4-.2-2.6.7.7-2.5-.2-.4A8 8 0 0112 4zm-3.3 4c-.2 0-.5.1-.7.4-.3.3-.8.9-.8 1.9s.8 2.1 1 2.3c.2.3 1.6 2.5 4 3.4 2 .8 2.4.7 2.8.6.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2l-.4-.3-1.6-.7c-.2-.1-.4-.1-.6.1l-.7.9c-.1.2-.3.2-.5.1a6.5 6.5 0 01-1.9-1.2 7 7 0 01-1.3-1.7c-.1-.2 0-.3.1-.4l.6-.7.1-.5-.7-1.6c-.2-.4-.4-.4-.5-.4z';
function Icon({
  name,
  size = 20,
  strokeWidth,
  style,
  ...rest
}) {
  if (name === 'whatsapp') {
    return /*#__PURE__*/React.createElement("svg", _extends({
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "currentColor",
      style: {
        flex: 'none',
        display: 'block',
        ...style
      }
    }, rest), /*#__PURE__*/React.createElement("path", {
      d: WHATSAPP
    }));
  }
  const entry = ICON_PATHS[name];
  if (!entry) return null;
  const [d, sw] = entry;
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: strokeWidth ?? sw,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      flex: 'none',
      display: 'block',
      ...style
    }
  }, rest), EXTRA[name] || null, d ? /*#__PURE__*/React.createElement("path", {
    d: d
  }) : null);
}
Object.assign(__ds_scope, { ICON_PATHS, Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Icon.jsx", error: String((e && e.message) || e) }); }

// components/brand/Logo.jsx
try { (() => {
const BARS = [{
  h: 0.458,
  c: 'var(--blue-300)'
}, {
  h: 0.708,
  c: 'var(--blue-400)'
}, {
  h: 1,
  c: null
}];
function Logo({
  height = 24,
  onNavy = true,
  lockup,
  title,
  subtitle,
  style
}) {
  const w = Math.round(height * 0.29);
  const gap = Math.max(2, Math.round(height * 0.125));
  const radius = height >= 30 ? 3 : 2;
  const mark = /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap,
      height,
      flex: 'none'
    }
  }, BARS.map((b, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      width: w,
      height: Math.round(height * b.h),
      borderRadius: radius,
      background: b.c || (onNavy ? '#fff' : 'var(--navy-800)')
    }
  })));
  if (!lockup) return /*#__PURE__*/React.createElement("div", {
    style: style
  }, mark);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      ...style
    }
  }, mark, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--fw-heavy) var(--text-17) / var(--lh-tight) var(--font-ui)',
      color: onNavy ? 'var(--text-on-navy)' : 'var(--ink-1)'
    }
  }, title), subtitle ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-12)',
      fontWeight: 'var(--fw-semibold)',
      letterSpacing: '.8px',
      color: onNavy ? 'var(--blue-300)' : 'var(--ink-6)'
    }
  }, subtitle) : null));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Logo.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  blue: ['var(--blue-100)', 'var(--blue-600)'],
  green: ['var(--green-100)', 'var(--green-700)'],
  orange: ['var(--orange-50)', 'var(--orange-600)'],
  red: ['var(--red-100)', 'var(--red-500)'],
  neutral: ['var(--surface-muted)', 'var(--ink-6)'],
  navy: ['var(--navy-800)', '#fff']
};
function Badge({
  tone = 'blue',
  size = 'md',
  children,
  style,
  ...rest
}) {
  const [bg, fg] = TONES[tone] || TONES.blue;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: bg,
      color: fg,
      fontFamily: 'var(--font-ui)',
      fontWeight: 'var(--fw-heavy)',
      fontSize: size === 'sm' ? 'var(--text-12)' : 'var(--text-12-5)',
      padding: size === 'sm' ? '4px 10px' : '5px 11px',
      borderRadius: 'var(--radius-pill)',
      whiteSpace: 'nowrap',
      letterSpacing: '.2px',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const BASE = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  fontFamily: 'var(--font-ui)',
  border: 'none',
  cursor: 'pointer',
  textDecoration: 'none',
  userSelect: 'none',
  whiteSpace: 'nowrap'
};
const SIZES = {
  sm: {
    padding: '9px 14px',
    fontSize: 'var(--text-13-5)',
    iconSize: 15
  },
  md: {
    padding: '12px 22px',
    fontSize: 'var(--text-14-5)',
    iconSize: 16
  },
  lg: {
    padding: '17px 24px',
    fontSize: 'var(--text-16)',
    iconSize: 20
  }
};
function Button({
  variant = 'primary',
  size = 'md',
  shape = 'pill',
  color,
  icon,
  iconAfter,
  disabled,
  href,
  children,
  style,
  ...rest
}) {
  const s = SIZES[size] || SIZES.md;
  const accent = color || 'var(--blue-500)';
  const looks = {
    primary: {
      background: accent,
      color: '#fff',
      fontWeight: 'var(--fw-heavy)'
    },
    secondary: {
      background: 'var(--surface-card)',
      color: 'var(--navy-800)',
      border: '2px solid var(--border-field)',
      fontWeight: 'var(--fw-bold)'
    },
    quiet: {
      background: 'var(--surface-muted)',
      color: 'var(--ink-5)',
      fontWeight: 'var(--fw-bold)'
    },
    whatsapp: {
      background: 'var(--whatsapp)',
      color: 'var(--whatsapp-ink)',
      fontWeight: 'var(--fw-heavy)'
    },
    onNavy: {
      background: 'var(--on-navy-fill)',
      color: '#fff',
      border: '1px solid var(--on-navy-border)',
      fontWeight: 'var(--fw-bold)'
    }
  }[variant] || {};
  const css = {
    ...BASE,
    ...s,
    ...looks,
    borderRadius: shape === 'pill' ? 'var(--radius-pill)' : 'var(--radius-10)',
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? 'none' : undefined,
    ...style
  };
  delete css.iconSize;
  const inner = /*#__PURE__*/React.createElement(React.Fragment, null, icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: s.iconSize
  }) : null, children, iconAfter ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconAfter,
    size: s.iconSize
  }) : null);
  if (href) return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    style: css
  }, rest), inner);
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: disabled,
    style: css
  }, rest), inner);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Callout.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  tip: {
    bg: 'var(--orange-50)',
    edge: 'var(--orange-500)',
    fg: 'var(--orange-700)',
    icon: 'lightbulb',
    iconColor: 'var(--orange-600)'
  },
  warn: {
    bg: 'var(--orange-100)',
    edge: 'var(--orange-500)',
    fg: 'var(--orange-700)',
    icon: 'warning',
    iconColor: 'var(--orange-600)'
  },
  info: {
    bg: 'var(--blue-100)',
    edge: 'var(--blue-500)',
    fg: 'var(--blue-600)',
    icon: 'lightbulb',
    iconColor: 'var(--blue-600)'
  }
};
function Callout({
  tone = 'tip',
  label,
  icon = true,
  children,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.tip;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      gap: 11,
      padding: '13px 15px',
      borderRadius: 'var(--radius-10)',
      background: t.bg,
      borderInlineStart: `4px solid ${t.edge}`,
      ...style
    }
  }, rest), label ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-14)',
      fontWeight: 'var(--fw-heavy)',
      color: t.iconColor,
      whiteSpace: 'nowrap'
    }
  }, label) : icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: t.icon,
    size: 19,
    style: {
      marginTop: 2,
      color: t.iconColor
    }
  }) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-15-5)',
      lineHeight: 'var(--lh-snug)',
      fontWeight: 'var(--fw-semibold)',
      color: t.fg
    }
  }, children));
}
Object.assign(__ds_scope, { Callout });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Callout.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Card({
  as = 'div',
  size = 'md',
  interactive,
  href,
  children,
  style,
  ...rest
}) {
  const pad = {
    sm: '16px 18px',
    md: '18px 20px',
    lg: '26px 24px'
  }[size] || '18px 20px';
  const radius = {
    sm: 'var(--radius-12)',
    md: 'var(--radius-14)',
    lg: 'var(--radius-18)'
  }[size] || 'var(--radius-14)';
  const css = {
    background: 'var(--surface-card)',
    border: '1px solid var(--border-card)',
    borderRadius: radius,
    boxShadow: 'var(--shadow-card)',
    padding: pad,
    color: 'var(--ink-1)',
    textDecoration: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    ...(interactive ? {
      cursor: 'pointer',
      transition: 'var(--transition-card)'
    } : null),
    ...style
  };
  const Tag = href ? 'a' : as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href,
    style: css
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function IconButton({
  icon,
  size = 'md',
  tone = 'neutral',
  title,
  href,
  style,
  ...rest
}) {
  const dim = size === 'sm' ? 30 : size === 'lg' ? 52 : 44;
  const tones = {
    neutral: {
      background: 'var(--surface-card)',
      border: '1.5px solid var(--border-field)',
      color: 'var(--ink-5)'
    },
    sunken: {
      background: 'var(--surface-sunken)',
      border: '1px solid var(--border-card)',
      color: 'var(--ink-5)'
    },
    danger: {
      background: 'var(--surface-card)',
      border: '1.5px solid var(--red-border)',
      color: 'var(--red-600)'
    },
    success: {
      background: 'var(--green-100)',
      border: 'none',
      color: 'var(--green-700)'
    },
    navy: {
      background: 'var(--navy-800)',
      border: 'none',
      color: '#fff',
      boxShadow: 'var(--shadow-fab)'
    }
  }[tone] || {};
  const css = {
    width: dim,
    height: dim,
    flex: 'none',
    borderRadius: tone === 'navy' ? 'var(--radius-circle)' : size === 'sm' ? 'var(--radius-8)' : 'var(--radius-10)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    textDecoration: 'none',
    ...tones,
    ...style
  };
  const glyph = /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: size === 'sm' ? 14 : size === 'lg' ? 24 : 15
  });
  if (href) return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    title: title,
    style: css
  }, rest), glyph);
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    title: title,
    style: css
  }, rest), glyph);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/LevelPill.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function LevelPill({
  label,
  color = 'var(--blue-500)',
  selected,
  dot = true,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      padding: '11px 18px',
      borderRadius: 'var(--radius-pill)',
      cursor: 'pointer',
      userSelect: 'none',
      fontFamily: 'var(--font-ui)',
      fontSize: 'var(--text-15-5)',
      fontWeight: 'var(--fw-bold)',
      border: `2px solid ${selected ? color : 'var(--border-field)'}`,
      background: selected ? color : 'var(--surface-card)',
      color: selected ? '#fff' : 'var(--ink-4)',
      ...style
    }
  }, rest), dot ? /*#__PURE__*/React.createElement("div", {
    style: {
      width: 10,
      height: 10,
      borderRadius: 'var(--radius-circle)',
      background: selected ? '#fff' : color
    }
  }) : null, label);
}
Object.assign(__ds_scope, { LevelPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/LevelPill.jsx", error: String((e && e.message) || e) }); }

// components/core/SectionLabel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SectionLabel({
  children,
  rule = true,
  accent,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      ...style
    }
  }, rest), accent ? /*#__PURE__*/React.createElement("div", {
    style: {
      width: 26,
      height: 2,
      background: accent,
      flex: 'none'
    }
  }) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-ui)',
      fontSize: 'var(--text-13-5)',
      fontWeight: 'var(--fw-heavy)',
      letterSpacing: 'var(--track-eyebrow)',
      color: 'var(--navy-800)',
      whiteSpace: 'nowrap'
    }
  }, children), rule ? /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 1,
      background: 'var(--border-rule)'
    }
  }) : null);
}
Object.assign(__ds_scope, { SectionLabel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SectionLabel.jsx", error: String((e && e.message) || e) }); }

// components/core/StatCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function StatCard({
  label,
  value,
  sub,
  color = 'var(--navy-800)',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-card)',
      borderRadius: 'var(--radius-14)',
      padding: 18,
      boxShadow: 'var(--shadow-card)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-12-5)',
      fontWeight: 'var(--fw-bold)',
      letterSpacing: '1.1px',
      color: 'var(--ink-7)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-num)',
      fontSize: 'var(--text-32)',
      fontWeight: 'var(--fw-black)',
      letterSpacing: 'var(--track-stat)',
      marginTop: 6,
      color
    }
  }, value), sub ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-13)',
      fontWeight: 'var(--fw-medium)',
      color: 'var(--ink-6)',
      marginTop: 2
    }
  }, sub) : null);
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/data/DataTable.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function DataTable({
  columns = [],
  rows = [],
  renderActions,
  style,
  ...rest
}) {
  const th = {
    textAlign: 'start',
    padding: '13px 16px',
    fontSize: 'var(--text-12-5)',
    fontWeight: 'var(--fw-heavy)',
    color: 'var(--ink-6)',
    background: 'var(--surface-sunken)',
    borderBottom: '1px solid var(--border-card)',
    whiteSpace: 'nowrap'
  };
  const td = {
    padding: '13px 16px',
    fontSize: 'var(--text-13-5)',
    color: 'var(--ink-1)',
    borderBottom: '1px solid var(--border-hair)'
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-card)',
      borderRadius: 'var(--radius-16)',
      overflow: 'auto',
      minWidth: 0,
      boxShadow: 'var(--shadow-card)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.key,
    style: th
  }, c.label)), renderActions ? /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      width: '1%'
    }
  }, "\u05E4\u05E2\u05D5\u05DC\u05D5\u05EA") : null)), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: r.id ?? i
  }, columns.map(c => /*#__PURE__*/React.createElement("td", {
    key: c.key,
    style: td
  }, r[c.key])), renderActions ? /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      whiteSpace: 'nowrap',
      width: '1%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      justifyContent: 'flex-end'
    }
  }, renderActions(r, i))) : null)))));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/data/DateChip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function DateChip({
  date,
  day,
  background = 'var(--navy-800)',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      flex: 'none',
      width: 52,
      height: 48,
      borderRadius: 'var(--radius-10)',
      background,
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-11)',
      fontWeight: 'var(--fw-semibold)',
      color: 'var(--blue-300)'
    }
  }, date), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-15)',
      fontWeight: 'var(--fw-heavy)'
    }
  }, day));
}
Object.assign(__ds_scope, { DateChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DateChip.jsx", error: String((e && e.message) || e) }); }

// components/data/DomainCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function DomainCard({
  icon,
  label,
  count,
  color,
  background,
  onClick,
  href,
  style,
  ...rest
}) {
  const Tag = href ? 'a' : 'div';
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href,
    onClick: onClick,
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-card)',
      borderRadius: 'var(--radius-18)',
      padding: '22px',
      boxShadow: 'var(--shadow-card)',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      textDecoration: 'none',
      color: 'var(--ink-1)',
      transition: 'var(--transition-card)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 48,
      height: 48,
      borderRadius: 'var(--radius-13)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background,
      color
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 24
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 4px',
      fontSize: 'var(--text-17)',
      fontWeight: 'var(--fw-heavy)'
    }
  }, label), count ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--text-13-5)',
      color: 'var(--ink-6)'
    }
  }, count) : null));
}
Object.assign(__ds_scope, { DomainCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DomainCard.jsx", error: String((e && e.message) || e) }); }

// components/data/ListRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ListRow({
  leading,
  title,
  meta,
  badge,
  actions,
  titleColor = 'var(--ink-1)',
  struck,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      background: 'var(--surface-card)',
      border: '1px solid var(--border-card)',
      borderRadius: 'var(--radius-12)',
      padding: '13px 16px',
      flexWrap: 'wrap',
      ...style
    }
  }, rest), leading, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-17)',
      fontWeight: 'var(--fw-heavy)',
      color: titleColor,
      textDecoration: struck ? 'line-through' : 'none'
    }
  }, title), meta ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-13-5)',
      fontWeight: 'var(--fw-medium)',
      color: 'var(--ink-6)'
    }
  }, meta) : null, badge ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 5
    }
  }, badge) : null), actions ? /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: 7
    }
  }, actions) : null);
}
Object.assign(__ds_scope, { ListRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ListRow.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EmptyState.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function EmptyState({
  children,
  variant = 'dashed',
  style,
  ...rest
}) {
  const solid = variant === 'solid';
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: 'var(--surface-card)',
      border: solid ? '1px solid var(--border-card)' : '1px dashed var(--blue-200)',
      borderRadius: solid ? 'var(--radius-18)' : 'var(--radius-12)',
      padding: solid ? '40px 20px' : 34,
      textAlign: 'center',
      fontSize: solid ? 'var(--text-14-5)' : 'var(--text-15)',
      fontWeight: 'var(--fw-semibold)',
      color: 'var(--ink-7)',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/feedback/SyncStatus.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STATES = {
  idle: ['var(--ink-7)', 'לא סונכרן'],
  syncing: ['var(--orange-500)', 'מסנכרן…'],
  synced: ['var(--green-500)', 'מסונכרן'],
  error: ['var(--red-600)', 'שגיאה בסנכרון']
};
function SyncStatus({
  state = 'idle',
  label,
  sub,
  onNavy = true,
  style,
  ...rest
}) {
  const [dot, fallback] = STATES[state] || STATES.idle;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flex: 'none',
      alignItems: 'center',
      gap: 9,
      padding: '8px 14px',
      borderRadius: 'var(--radius-9)',
      cursor: 'pointer',
      userSelect: 'none',
      border: onNavy ? '1px solid var(--on-navy-border)' : '1px solid var(--border-card)',
      background: onNavy ? 'var(--on-navy-fill)' : 'var(--surface-card)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 9,
      height: 9,
      flex: 'none',
      borderRadius: 'var(--radius-circle)',
      background: dot
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      lineHeight: 1.2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-13)',
      fontWeight: 'var(--fw-bold)',
      color: onNavy ? '#fff' : 'var(--ink-1)'
    }
  }, label || fallback), sub ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-11)',
      fontWeight: 'var(--fw-medium)',
      color: onNavy ? 'var(--blue-300)' : 'var(--ink-7)'
    }
  }, sub) : null));
}
Object.assign(__ds_scope, { SyncStatus });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/SyncStatus.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Checkbox({
  checked,
  label,
  color = 'var(--blue-500)',
  size = 'md',
  style,
  ...rest
}) {
  const box = size === 'print' ? 19 : 22;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: size === 'print' ? 11 : 12,
      padding: size === 'print' ? 0 : '13px 15px',
      borderRadius: 'var(--radius-10)',
      cursor: 'pointer',
      userSelect: 'none',
      border: size === 'print' ? undefined : `2px solid ${checked ? color : 'var(--border-field)'}`,
      background: size === 'print' ? undefined : checked ? 'var(--surface-sunken)' : 'var(--surface-card)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 'none',
      width: box,
      height: box,
      marginTop: size === 'print' ? 2 : 1,
      borderRadius: size === 'print' ? 'var(--radius-5)' : 'var(--radius-6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      border: `2px solid ${checked ? color : size === 'print' ? 'var(--ink-9)' : 'var(--border-field)'}`,
      background: checked ? color : 'transparent'
    }
  }, checked ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 13,
    strokeWidth: 3.4
  }) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-16)',
      lineHeight: 'var(--lh-snug)',
      fontWeight: 'var(--fw-semibold)',
      color: checked ? 'var(--ink-7)' : 'var(--ink-2)',
      textDecoration: checked && size !== 'print' ? 'line-through' : 'none'
    }
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/SelectField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SelectField({
  label,
  options = [],
  onAdd,
  style,
  wrapStyle,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      ...wrapStyle
    }
  }, label ? /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 'var(--text-13-5)',
      fontWeight: 'var(--fw-bold)',
      color: 'var(--ink-7)'
    }
  }, label) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    style: {
      width: '100%',
      height: 'var(--field-h)',
      padding: '0 14px 0 34px',
      border: '2px solid var(--border-field)',
      borderRadius: 'var(--radius-10)',
      background: 'var(--surface-sunken)',
      fontFamily: 'var(--font-ui)',
      fontSize: 'var(--text-16)',
      fontWeight: 'var(--fw-semibold)',
      color: 'var(--ink-1)',
      outline: 'none',
      appearance: 'none',
      cursor: 'pointer',
      ...style
    }
  }, rest), options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o,
    value: o
  }, o))), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 17,
    style: {
      position: 'absolute',
      insetInlineEnd: 12,
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      color: 'var(--ink-6)'
    }
  })), onAdd ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onAdd,
    style: {
      flex: 'none',
      width: 42,
      borderRadius: 'var(--radius-10)',
      border: '2px solid var(--border-field)',
      background: 'var(--surface-sunken)',
      color: 'var(--ink-5)',
      fontSize: 18,
      fontWeight: 'var(--fw-bold)',
      cursor: 'pointer'
    }
  }, "+") : null));
}
Object.assign(__ds_scope, { SelectField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SelectField.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function TextField({
  label,
  hint,
  type = 'text',
  multiline,
  rows = 3,
  shape = 'rounded',
  dir,
  style,
  wrapStyle,
  ...rest
}) {
  const field = {
    width: '100%',
    height: multiline ? undefined : 'var(--field-h)',
    padding: multiline ? '12px 14px' : '0 14px',
    border: '2px solid var(--border-field)',
    borderRadius: shape === 'pill' ? 'var(--radius-pill)' : 'var(--radius-10)',
    background: 'var(--surface-sunken)',
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--text-16)',
    fontWeight: 'var(--fw-semibold)',
    color: 'var(--ink-1)',
    outline: 'none',
    textAlign: dir === 'ltr' ? 'left' : 'right',
    resize: multiline ? 'vertical' : undefined,
    ...style
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      ...wrapStyle
    }
  }, label ? /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 'var(--text-13-5)',
      fontWeight: 'var(--fw-bold)',
      color: 'var(--ink-7)'
    }
  }, label) : null, multiline ? /*#__PURE__*/React.createElement("textarea", _extends({
    rows: rows,
    dir: dir,
    style: field
  }, rest)) : /*#__PURE__*/React.createElement("input", _extends({
    type: type,
    dir: dir,
    style: field
  }, rest)), hint ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-13)',
      fontWeight: 'var(--fw-medium)',
      color: 'var(--ink-7)'
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { TextField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextField.jsx", error: String((e && e.message) || e) }); }

// components/navigation/AppHeader.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function AppHeader({
  title,
  subtitle,
  tabs = [],
  activeTab,
  onTabChange,
  actions,
  maxWidth = 'var(--page-max-wide)',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: 'var(--navy-800)',
      color: '#fff',
      position: 'sticky',
      top: 0,
      zIndex: 20,
      boxShadow: 'var(--shadow-header)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth,
      margin: '0 auto',
      padding: '14px var(--page-gutter) 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Logo, {
    height: 24,
    lockup: true,
    title: title,
    subtitle: subtitle
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      flexWrap: 'wrap'
    }
  }, actions)), tabs.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      marginTop: 14,
      overflowX: 'auto'
    }
  }, tabs.map(t => {
    const on = t.id === activeTab;
    return /*#__PURE__*/React.createElement("div", {
      key: t.id,
      onClick: () => onTabChange && onTabChange(t.id),
      style: {
        flex: 'none',
        padding: '12px 20px',
        borderRadius: 'var(--radius-tab)',
        fontSize: 'var(--text-15)',
        fontWeight: 'var(--fw-bold)',
        cursor: 'pointer',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        background: on ? 'var(--surface-canvas)' : 'transparent',
        color: on ? 'var(--navy-800)' : 'var(--blue-300)'
      }
    }, t.label);
  })) : null));
}
Object.assign(__ds_scope, { AppHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/AppHeader.jsx", error: String((e && e.message) || e) }); }

// components/navigation/HomeFab.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function HomeFab({
  href = 'home.html',
  title = 'בית',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement(__ds_scope.IconButton, _extends({
    icon: "home",
    size: "lg",
    tone: "navy",
    href: href,
    title: title,
    style: {
      position: 'fixed',
      top: 14,
      insetInlineEnd: 'auto',
      insetInlineStart: 14,
      zIndex: 99,
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { HomeFab });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/HomeFab.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SidebarNav.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SidebarNav({
  title,
  subtitle,
  items = [],
  activeId,
  onSelect,
  footer,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("aside", _extends({
    style: {
      width: 250,
      flex: 'none',
      background: 'var(--navy-800)',
      padding: '30px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 26,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(__ds_scope.Logo, {
    height: 30,
    style: {
      marginBottom: 14
    }
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '0 0 4px',
      fontSize: 'var(--text-19)',
      fontWeight: 'var(--fw-heavy)',
      color: '#fff'
    }
  }, title), subtitle ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--text-12-5)',
      fontWeight: 'var(--fw-medium)',
      color: 'var(--blue-300)',
      lineHeight: 'var(--lh-snug)'
    }
  }, subtitle) : null), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, items.map(it => {
    const on = it.id === activeId;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      onClick: () => onSelect && onSelect(it.id),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '11px 14px',
        borderRadius: 'var(--radius-12)',
        border: 'none',
        background: on ? 'var(--on-navy-fill-strong)' : 'transparent',
        color: '#fff',
        fontFamily: 'var(--font-ui)',
        fontSize: 'var(--text-14-5)',
        fontWeight: 'var(--fw-bold)',
        cursor: 'pointer',
        textAlign: 'start',
        width: '100%'
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: it.icon,
      size: 19,
      style: {
        color: on ? '#fff' : 'var(--blue-300)'
      }
    }), it.label);
  })), footer ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      paddingTop: 14,
      borderTop: '1px solid var(--on-navy-divider)'
    }
  }, footer) : null);
}
Object.assign(__ds_scope, { SidebarNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SidebarNav.jsx", error: String((e && e.message) || e) }); }

// ui_kits/kunik-home/DomainView.jsx
try { (() => {
function DomainView({
  domain,
  onAdd
}) {
  const {
    DataTable,
    Button,
    TextField,
    Badge,
    IconButton,
    EmptyState
  } = window.KunikDesignSystem_63ae72;
  const [q, setQ] = React.useState('');
  const withBadge = rows => rows.filter(r => JSON.stringify(r).includes(q)).map(r => ({
    ...r,
    statusCell: r.badge ? /*#__PURE__*/React.createElement(Badge, {
      tone: r.badge[1],
      size: "sm"
    }, r.badge[0]) : null
  }));
  const cols = domain.badgeless ? domain.columns : [...domain.columns, {
    key: 'statusCell',
    label: 'סטטוס'
  }];
  const hasBadges = (domain.items || []).some(i => i.badge) || (domain.groups || []).some(g => g.items.some(i => i.badge));
  const columns = hasBadges ? [...domain.columns, {
    key: 'statusCell',
    label: 'סטטוס'
  }] : domain.columns;
  const actions = r => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(IconButton, {
    icon: "edit",
    size: "sm",
    tone: "sunken",
    title: "\u05E2\u05E8\u05D9\u05DB\u05D4"
  }), /*#__PURE__*/React.createElement(IconButton, {
    icon: "trash",
    size: "sm",
    tone: "sunken",
    title: "\u05DE\u05D7\u05D9\u05E7\u05D4",
    style: {
      color: 'var(--red-500)'
    }
  }), r.phone && r.phone !== '—' ? /*#__PURE__*/React.createElement(IconButton, {
    icon: "message",
    size: "sm",
    tone: "success",
    title: "\u05D5\u05D5\u05D0\u05D8\u05E1\u05D0\u05E4"
  }) : null);
  const total = domain.groups ? null : domain.items.length;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '0 0 6px',
      fontSize: 26,
      fontWeight: 800
    }
  }, domain.label), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--ink-6)',
      fontSize: 14.5
    }
  }, domain.groups ? domain.groups.length + ' חודשים' : total + ' רשומות')), /*#__PURE__*/React.createElement(Button, {
    icon: "plus",
    color: domain.color,
    onClick: onAdd
  }, "\u05D4\u05D5\u05E1\u05E4\u05EA \u05E8\u05E9\u05D5\u05DE\u05D4")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      maxWidth: 340
    }
  }, /*#__PURE__*/React.createElement(TextField, {
    shape: "pill",
    placeholder: "\u05D7\u05D9\u05E4\u05D5\u05E9...",
    value: q,
    onChange: e => setQ(e.target.value)
  })), domain.groups ? domain.groups.map(g => /*#__PURE__*/React.createElement("div", {
    key: g.label,
    style: {
      marginTop: 26
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: domain.bg,
      padding: '12px 18px',
      borderRadius: '12px 12px 0 0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      fontSize: 15,
      color: domain.color
    }
  }, g.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      fontSize: 15,
      color: domain.color
    }
  }, "\u05E1\u05D4\"\u05DB: ", g.total)), /*#__PURE__*/React.createElement(DataTable, {
    style: {
      borderRadius: '0 0 14px 14px',
      borderTop: 'none'
    },
    columns: columns,
    rows: withBadge(g.items),
    renderActions: actions
  }))) : /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 26
    }
  }, withBadge(domain.items).length ? /*#__PURE__*/React.createElement(DataTable, {
    columns: columns,
    rows: withBadge(domain.items),
    renderActions: actions
  }) : /*#__PURE__*/React.createElement(EmptyState, {
    variant: "solid"
  }, "\u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0\u05D5 \u05E8\u05E9\u05D5\u05DE\u05D5\u05EA \u05E9\u05DE\u05EA\u05D0\u05D9\u05DE\u05D5\u05EA \u05DC\u05D7\u05D9\u05E4\u05D5\u05E9.")));
}
Object.assign(window, {
  DomainView
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/kunik-home/DomainView.jsx", error: String((e && e.message) || e) }); }

// ui_kits/kunik-home/Overview.jsx
try { (() => {
function Overview({
  go
}) {
  const {
    DomainCard,
    Badge,
    Button,
    SectionLabel,
    EmptyState
  } = window.KunikDesignSystem_63ae72;
  const D = window.KH_DOMAINS,
    U = window.KH_UPCOMING;
  const count = d => d.groups ? d.groups.reduce((n, g) => n + g.items.length, 0) : d.items.length;
  const bars = [{
    label: 'יוני',
    income: 12100,
    expense: 1290
  }, {
    label: 'יולי',
    income: 12900,
    expense: 1322
  }, {
    label: 'אוגוסט',
    income: 12400,
    expense: 1847
  }];
  const max = 13500;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '0 0 6px',
      fontSize: 27,
      fontWeight: 800
    }
  }, "\u05E1\u05E7\u05D9\u05E8\u05D4 \u05DB\u05DC\u05DC\u05D9\u05EA"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 14.5,
      color: 'var(--ink-6)'
    }
  }, "\u05DB\u05DC \u05D4\u05EA\u05D7\u05D5\u05DE\u05D9\u05DD \u05E9\u05DC\u05DA \u05D1\u05DE\u05D1\u05D8 \u05D0\u05D7\u05D3. \u05DC\u05D7\u05E6\u05D5 \u05E2\u05DC \u05EA\u05D7\u05D5\u05DD \u05DB\u05D3\u05D9 \u05DC\u05D4\u05D9\u05DB\u05E0\u05E1 \u05D0\u05DC\u05D9\u05D5.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))',
      gap: 18,
      marginTop: 28
    }
  }, D.map(d => /*#__PURE__*/React.createElement(DomainCard, {
    key: d.key,
    className: "lift",
    icon: d.icon,
    label: d.label,
    count: count(d) + ' רשומות',
    color: d.color,
    background: d.bg,
    onClick: () => go(d.key)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 36
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: 'var(--ink-6)',
      letterSpacing: '.4px',
      margin: '0 0 12px'
    }
  }, "\u05D4\u05DB\u05E0\u05E1\u05D5\u05EA \u05DE\u05D5\u05DC \u05EA\u05E9\u05DC\u05D5\u05DE\u05D9\u05DD \u05DC\u05E4\u05D9 \u05D7\u05D5\u05D3\u05E9"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-card)',
      borderRadius: 'var(--radius-18)',
      padding: '26px 28px 20px',
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 18,
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--ink-4)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 11,
      height: 11,
      borderRadius: 3,
      background: 'var(--domain-income)'
    }
  }), "\u05D4\u05DB\u05E0\u05E1\u05D5\u05EA"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--ink-4)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 11,
      height: 11,
      borderRadius: 3,
      background: 'var(--domain-payments)'
    }
  }), "\u05EA\u05E9\u05DC\u05D5\u05DE\u05D9\u05DD")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 26,
      minHeight: 180
    }
  }, bars.map(b => /*#__PURE__*/React.createElement("div", {
    key: b.label,
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 7,
      height: 170,
      width: '100%',
      justifyContent: 'center'
    }
  }, [['income', 'var(--domain-income)'], ['expense', 'var(--domain-payments)']].map(([k, c]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: c
    }
  }, "\u20AA", b[k].toLocaleString()), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 26,
      borderRadius: '6px 6px 0 0',
      background: c,
      height: Math.round(b[k] / max * 145)
    }
  })))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--ink-6)',
      borderTop: '1px solid var(--border-card)',
      paddingTop: 9,
      width: '100%',
      textAlign: 'center'
    }
  }, b.label)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 36,
      paddingBottom: 40
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: 'var(--ink-6)',
      letterSpacing: '.4px',
      margin: '0 0 12px'
    }
  }, "\u05D4\u05EA\u05E8\u05D0\u05D5\u05EA \u05E7\u05E8\u05D5\u05D1\u05D5\u05EA"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-card)',
      borderRadius: 'var(--radius-18)',
      boxShadow: 'var(--shadow-card)',
      overflow: 'hidden'
    }
  }, U.map((u, i) => /*#__PURE__*/React.createElement("div", {
    key: u.name,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 20px',
      borderBottom: i === U.length - 1 ? 'none' : '1px solid var(--border-hair)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: '50%',
      flex: 'none',
      background: u.color
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14.5
    }
  }, u.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'var(--ink-7)'
    }
  }, u.domain, " \xB7 ", u.date)), /*#__PURE__*/React.createElement(Badge, {
    tone: u.badge[1]
  }, u.badge[0]), u.wa && /*#__PURE__*/React.createElement(Button, {
    variant: "whatsapp",
    size: "sm",
    icon: "whatsapp"
  }, "\u05EA\u05D6\u05DB\u05D5\u05E8\u05EA \u05D1\u05D5\u05D5\u05D0\u05D8\u05E1\u05D0\u05E4"))))));
}
Object.assign(window, {
  Overview
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/kunik-home/Overview.jsx", error: String((e && e.message) || e) }); }

// ui_kits/kunik-home/RecordForm.jsx
try { (() => {
function RecordForm({
  domain,
  onClose
}) {
  const {
    TextField,
    SelectField,
    Button,
    IconButton
  } = window.KunikDesignSystem_63ae72;
  const fields = domain.columns;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'var(--scrim-modal)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      zIndex: 50
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-20)',
      padding: 30,
      maxWidth: 480,
      width: '100%',
      maxHeight: '86vh',
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 19,
      fontWeight: 800
    }
  }, "\u05D4\u05D5\u05E1\u05E4\u05D4 \u2014 ", domain.label), /*#__PURE__*/React.createElement(IconButton, {
    icon: "close",
    size: "sm",
    tone: "sunken",
    title: "\u05E1\u05D2\u05D9\u05E8\u05D4",
    onClick: onClose
  })), fields.map(c => c.key === 'category' ? /*#__PURE__*/React.createElement(SelectField, {
    key: c.key,
    label: c.label,
    options: ['זיהוי', 'משפטי', 'דיור', 'רפואי'],
    onAdd: () => {}
  }) : /*#__PURE__*/React.createElement(TextField, {
    key: c.key,
    label: c.label,
    dir: /phone|טלפון/.test(c.key + c.label) ? 'ltr' : undefined
  })), /*#__PURE__*/React.createElement(TextField, {
    label: "\u05D4\u05E2\u05E8\u05D5\u05EA",
    multiline: true,
    rows: 3
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    color: domain.color,
    style: {
      flex: 1,
      padding: 13
    },
    onClick: onClose
  }, "\u05E9\u05DE\u05D9\u05E8\u05D4"), /*#__PURE__*/React.createElement(Button, {
    variant: "quiet",
    style: {
      padding: '13px 22px'
    },
    onClick: onClose
  }, "\u05D1\u05D9\u05D8\u05D5\u05DC"))));
}
Object.assign(window, {
  RecordForm
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/kunik-home/RecordForm.jsx", error: String((e && e.message) || e) }); }

// ui_kits/kunik-home/data.js
try { (() => {
window.KH_DOMAINS = [{
  key: 'insurance',
  label: 'ביטוחים',
  icon: 'shield',
  color: 'var(--domain-insurance)',
  bg: 'var(--domain-insurance-bg)',
  columns: [{
    key: 'type',
    label: 'סוג ביטוח'
  }, {
    key: 'company',
    label: 'חברה מבטחת'
  }, {
    key: 'phone',
    label: 'טלפון'
  }, {
    key: 'amount',
    label: 'סכום לחיוב'
  }, {
    key: 'renewal',
    label: 'תאריך חידוש'
  }],
  items: [{
    id: 1,
    type: 'ביטוח דירה',
    company: 'הראל',
    phone: '03-754-0000',
    amount: '₪142',
    renewal: '12.11.26',
    badge: ['בקרוב', 'orange']
  }, {
    id: 2,
    type: 'ביטוח בריאות משלים',
    company: 'כלל',
    phone: '03-638-8888',
    amount: '₪310',
    renewal: '01.03.27',
    badge: null
  }, {
    id: 3,
    type: 'ביטוח חיים',
    company: 'מגדל',
    phone: '03-519-9999',
    amount: '₪218',
    renewal: '27.08.26',
    badge: ['דחוף — 16 ימים', 'red']
  }, {
    id: 4,
    type: 'ביטוח נסיעות',
    company: 'פספורטכארד',
    phone: '03-777-1010',
    amount: '—',
    renewal: '—',
    badge: null
  }]
}, {
  key: 'savings',
  label: 'חסכונות והשקעות',
  icon: 'bars',
  color: 'var(--domain-savings)',
  bg: 'var(--domain-savings-bg)',
  columns: [{
    key: 'name',
    label: 'שם החיסכון'
  }, {
    key: 'institution',
    label: 'גוף מנהל'
  }, {
    key: 'balance',
    label: 'יתרה נוכחית'
  }, {
    key: 'type',
    label: 'סוג'
  }],
  items: [{
    id: 1,
    name: 'קרן השתלמות',
    institution: 'אלטשולר שחם',
    balance: '₪84,300',
    type: 'מסלול כללי'
  }, {
    id: 2,
    name: 'קופת גמל להשקעה',
    institution: 'מיטב',
    balance: '₪31,900',
    type: 'מניות'
  }, {
    id: 3,
    name: 'פיקדון בנקאי',
    institution: 'בנק לאומי',
    balance: '₪22,000',
    type: 'שקלי, שנתי'
  }]
}, {
  key: 'health',
  label: 'תרופות ובריאות',
  icon: 'heart',
  color: 'var(--domain-health)',
  bg: 'var(--domain-health-bg)',
  columns: [{
    key: 'name',
    label: 'שם התרופה/הטיפול'
  }, {
    key: 'dosage',
    label: 'מינון/תדירות'
  }, {
    key: 'doctor',
    label: 'רופא/מרפאה'
  }, {
    key: 'phone',
    label: 'טלפון'
  }, {
    key: 'nextAppt',
    label: 'תור הבא'
  }],
  items: [{
    id: 1,
    name: 'בדיקת דם שנתית',
    dosage: 'פעם בשנה',
    doctor: 'ד"ר אבירם, כללית',
    phone: '03-522-1188',
    nextAppt: '02.09.26',
    badge: ['בקרוב', 'orange']
  }, {
    id: 2,
    name: 'ויטמין D',
    dosage: 'טיפה ביום',
    doctor: '—',
    phone: '—',
    nextAppt: '—',
    badge: null
  }, {
    id: 3,
    name: 'מעקב עיניים',
    dosage: 'כל חצי שנה',
    doctor: 'ד"ר לוין',
    phone: '09-744-2200',
    nextAppt: '18.08.26',
    badge: ['דחוף — 7 ימים', 'red']
  }]
}, {
  key: 'vehicles',
  label: 'רכבים',
  icon: 'car',
  color: 'var(--domain-vehicles)',
  bg: 'var(--domain-vehicles-bg)',
  columns: [{
    key: 'nickname',
    label: 'רכב'
  }, {
    key: 'plate',
    label: 'מספר רישוי'
  }, {
    key: 'licenseExpiry',
    label: 'תוקף רישיון'
  }, {
    key: 'testDate',
    label: 'טסט הבא'
  }, {
    key: 'insuranceCompany',
    label: 'חברת ביטוח'
  }, {
    key: 'amount',
    label: 'עלות חודשית'
  }],
  items: [{
    id: 1,
    nickname: 'מאזדה 3 — לבנה',
    plate: '55-238-01',
    licenseExpiry: '30.01.27',
    testDate: '14.09.26',
    insuranceCompany: 'שלמה',
    amount: '₪265',
    badge: null
  }, {
    id: 2,
    nickname: 'קיה פיקנטו',
    plate: '12-994-73',
    licenseExpiry: '22.08.26',
    testDate: '22.08.26',
    insuranceCompany: 'איילון',
    amount: '₪180',
    badge: ['דחוף — 11 ימים', 'red']
  }]
}, {
  key: 'documents',
  label: 'מסמכים חשובים',
  icon: 'document',
  color: 'var(--domain-documents)',
  bg: 'var(--domain-documents-bg)',
  columns: [{
    key: 'name',
    label: 'שם המסמך'
  }, {
    key: 'category',
    label: 'קטגוריה'
  }, {
    key: 'location',
    label: 'איפה נמצא'
  }, {
    key: 'expiry',
    label: 'תוקף'
  }],
  items: [{
    id: 1,
    name: 'דרכון',
    category: 'זיהוי',
    location: 'כספת בבית',
    expiry: '04.06.29'
  }, {
    id: 2,
    name: 'צוואה',
    category: 'משפטי',
    location: 'עו"ד שרון, תיק 1182',
    expiry: '—'
  }, {
    id: 3,
    name: 'תעודת נישואין',
    category: 'זיהוי',
    location: 'תיקייה כחולה, מגירה עליונה',
    expiry: '—'
  }, {
    id: 4,
    name: 'חוזה שכירות',
    category: 'דיור',
    location: 'מייל + עותק מודפס',
    expiry: '31.12.26'
  }]
}, {
  key: 'payments',
  label: 'תזכורות לתשלומים',
  icon: 'bell',
  color: 'var(--domain-payments)',
  bg: 'var(--domain-payments-bg)',
  monthly: true,
  columns: [{
    key: 'name',
    label: 'שם התשלום'
  }, {
    key: 'amount',
    label: 'סכום'
  }, {
    key: 'dueDate',
    label: 'תאריך לתשלום'
  }, {
    key: 'phone',
    label: 'טלפון'
  }],
  groups: [{
    label: 'אוגוסט 2026',
    total: '₪1,847',
    items: [{
      id: 1,
      name: 'ארנונה',
      amount: '₪612',
      dueDate: '15.08.26',
      phone: '09-777-0000',
      badge: ['בקרוב', 'orange']
    }, {
      id: 2,
      name: 'חשמל',
      amount: '₪430',
      dueDate: '21.08.26',
      phone: '103',
      badge: null
    }, {
      id: 3,
      name: 'ועד בית',
      amount: '₪280',
      dueDate: '01.08.26',
      phone: '—',
      badge: ['שולם', 'green']
    }, {
      id: 4,
      name: 'ביטוח רכב',
      amount: '₪525',
      dueDate: '28.08.26',
      phone: '03-666-1234',
      badge: null
    }]
  }, {
    label: 'יולי 2026',
    total: '₪1,322',
    items: [{
      id: 5,
      name: 'ארנונה',
      amount: '₪612',
      dueDate: '15.07.26',
      phone: '09-777-0000',
      badge: ['שולם', 'green']
    }, {
      id: 6,
      name: 'חשמל',
      amount: '₪430',
      dueDate: '21.07.26',
      phone: '103',
      badge: ['שולם', 'green']
    }, {
      id: 7,
      name: 'ועד בית',
      amount: '₪280',
      dueDate: '01.07.26',
      phone: '—',
      badge: ['שולם', 'green']
    }]
  }]
}, {
  key: 'income',
  label: 'הכנסות',
  icon: 'trending-up',
  color: 'var(--domain-income)',
  bg: 'var(--domain-income-bg)',
  monthly: true,
  columns: [{
    key: 'source',
    label: 'מקור ההכנסה'
  }, {
    key: 'amount',
    label: 'סכום'
  }, {
    key: 'frequency',
    label: 'תדירות'
  }, {
    key: 'date',
    label: 'תאריך אחרון'
  }],
  groups: [{
    label: 'אוגוסט 2026',
    total: '₪12,400',
    items: [{
      id: 1,
      source: 'משכורת',
      amount: '₪10,200',
      frequency: 'חודשי',
      date: '01.08.26'
    }, {
      id: 2,
      source: 'שיעורי טכנולוגיה',
      amount: '₪2,200',
      frequency: 'חודשי',
      date: '09.08.26'
    }]
  }, {
    label: 'יולי 2026',
    total: '₪12,900',
    items: [{
      id: 3,
      source: 'משכורת',
      amount: '₪10,200',
      frequency: 'חודשי',
      date: '01.07.26'
    }, {
      id: 4,
      source: 'שיעורי טכנולוגיה',
      amount: '₪2,700',
      frequency: 'חודשי',
      date: '10.07.26'
    }]
  }]
}];
window.KH_UPCOMING = [{
  name: 'ביטוח חיים — מגדל',
  domain: 'ביטוחים',
  color: 'var(--domain-insurance)',
  date: '27.08.26',
  badge: ['דחוף — 16 ימים', 'red'],
  wa: true
}, {
  name: 'טסט — קיה פיקנטו',
  domain: 'רכבים',
  color: 'var(--domain-vehicles)',
  date: '22.08.26',
  badge: ['דחוף — 11 ימים', 'red'],
  wa: false
}, {
  name: 'מעקב עיניים — ד"ר לוין',
  domain: 'תרופות ובריאות',
  color: 'var(--domain-health)',
  date: '18.08.26',
  badge: ['דחוף — 7 ימים', 'red'],
  wa: true
}, {
  name: 'ארנונה',
  domain: 'תזכורות לתשלומים',
  color: 'var(--domain-payments)',
  date: '15.08.26',
  badge: ['בקרוב', 'orange'],
  wa: false
}, {
  name: 'בדיקת דם שנתית',
  domain: 'תרופות ובריאות',
  color: 'var(--domain-health)',
  date: '02.09.26',
  badge: ['בקרוב', 'orange'],
  wa: true
}];
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/kunik-home/data.js", error: String((e && e.message) || e) }); }

// ui_kits/tech-eye-level/BusinessApp.jsx
try { (() => {
const DS = () => window.KunikDesignSystem_63ae72;
const STUDENTS = [{
  id: 1,
  name: 'מרים כהן',
  phone: '052-441-9082',
  level: 'רמה 1',
  day: 'ראשון',
  time: '10:00',
  price: '₪150',
  status: 'פעיל',
  paid: true
}, {
  id: 2,
  name: 'יהודית ברק',
  phone: '054-772-3311',
  level: 'רמה 2',
  day: 'ראשון',
  time: '16:30',
  price: '₪150',
  status: 'פעיל',
  paid: true
}, {
  id: 3,
  name: 'רחל אבידן',
  phone: '050-318-7740',
  level: 'רמה 1',
  day: 'שלישי',
  time: '09:30',
  price: '₪140',
  status: 'פעיל',
  paid: false
}, {
  id: 4,
  name: 'שרה מזרחי',
  phone: '053-909-1265',
  level: 'רמה 3',
  day: 'שלישי',
  time: '11:00',
  price: '₪160',
  status: 'פעיל',
  paid: true
}, {
  id: 5,
  name: 'נעמי גל',
  phone: '052-660-4418',
  level: 'רמה 2',
  day: 'שלישי',
  time: '17:00',
  price: '₪150',
  status: 'פעיל',
  paid: false
}, {
  id: 6,
  name: 'אסתר פרידמן',
  phone: '054-201-8873',
  level: 'רמה 1',
  day: 'חמישי',
  time: '10:30',
  price: '₪140',
  status: 'הפסקה',
  paid: true
}];
const PAYMENTS = [{
  id: 1,
  name: 'מרים כהן',
  month: 'אוגוסט 2026',
  lessons: '4',
  amount: '₪600',
  method: 'ביט',
  state: 'שולם'
}, {
  id: 2,
  name: 'יהודית ברק',
  month: 'אוגוסט 2026',
  lessons: '4',
  amount: '₪600',
  method: 'מזומן',
  state: 'שולם'
}, {
  id: 3,
  name: 'רחל אבידן',
  month: 'אוגוסט 2026',
  lessons: '3',
  amount: '₪420',
  method: '—',
  state: 'ממתין'
}, {
  id: 4,
  name: 'נעמי גל',
  month: 'יולי 2026',
  lessons: '4',
  amount: '₪600',
  method: '—',
  state: 'באיחור'
}];
function BusinessHome({
  go,
  onTab
}) {
  const {
    StatCard,
    SectionLabel,
    ListRow,
    DateChip,
    Badge,
    Button,
    IconButton,
    Icon,
    Card,
    EmptyState
  } = DS();
  const quick = [{
    title: 'תלמידה חדשה',
    sub: 'הוספה לרשימה',
    bg: 'var(--blue-100)',
    fg: 'var(--blue-600)',
    tab: 'students'
  }, {
    title: 'רישום תשלום',
    sub: 'לחודש הנוכחי',
    bg: 'var(--green-100)',
    fg: 'var(--green-700)',
    tab: 'payments'
  }, {
    title: 'שיעור חד־פעמי',
    sub: 'מחוץ ללוז הקבוע',
    bg: 'var(--orange-50)',
    fg: 'var(--orange-600)',
    tab: 'schedule'
  }];
  const link = (icon, bg, fg, title, sub, to) => /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      to && go(to);
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 13,
      background: 'var(--surface-card)',
      border: '1px solid var(--border-card)',
      borderRadius: 'var(--radius-14)',
      padding: '16px 18px',
      textDecoration: 'none',
      color: 'var(--ink-1)',
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 'none',
      width: 42,
      height: 42,
      borderRadius: 'var(--radius-11)',
      background: bg,
      color: fg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 21
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 800
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: 'var(--ink-6)'
    }
  }, sub)));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "\u05DE\u05E6\u05D1 \u05D4\u05E2\u05E1\u05E7"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(146px,1fr))',
      gap: 12,
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "\u05EA\u05DC\u05DE\u05D9\u05D3\u05D5\u05EA \u05E4\u05E2\u05D9\u05DC\u05D5\u05EA",
    value: "5",
    sub: "\u05DE\u05EA\u05D5\u05DA 6 \u05D1\u05DB\u05E8\u05D8\u05D9\u05E1\u05D9\u05D9\u05D4"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "\u05E9\u05D9\u05E2\u05D5\u05E8\u05D9\u05DD \u05D4\u05E9\u05D1\u05D5\u05E2",
    value: "6",
    sub: "4 \u05E7\u05D1\u05D5\u05E2\u05D9\u05DD, 2 \u05D4\u05E9\u05DC\u05DE\u05D5\u05EA"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "\u05D4\u05DB\u05E0\u05E1\u05D5\u05EA \u05D0\u05D5\u05D2\u05D5\u05E1\u05D8",
    value: "\u20AA2,220",
    sub: "3 \u05DE\u05EA\u05D5\u05DA 5 \u05E9\u05D5\u05DC\u05DE\u05D5",
    color: "var(--green-700)"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "\u05DE\u05DE\u05EA\u05D9\u05DF \u05DC\u05EA\u05E9\u05DC\u05D5\u05DD",
    value: "\u20AA1,020",
    sub: "2 \u05EA\u05DC\u05DE\u05D9\u05D3\u05D5\u05EA",
    color: "var(--orange-600)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      marginTop: 16,
      flexWrap: 'wrap'
    }
  }, quick.map(q => /*#__PURE__*/React.createElement("div", {
    key: q.title,
    onClick: () => onTab(q.tab),
    style: {
      flex: 1,
      minWidth: 200,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      background: 'var(--surface-card)',
      border: '1px solid var(--border-card)',
      borderRadius: 'var(--radius-14)',
      padding: '16px 18px',
      cursor: 'pointer',
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 'none',
      width: 44,
      height: 44,
      borderRadius: 'var(--radius-11)',
      background: q.bg,
      color: q.fg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 22,
      fontWeight: 800
    }
  }, "+"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 800
    }
  }, q.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: 'var(--ink-6)'
    }
  }, q.sub))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 26
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "\u05DC\u05D4\u05DB\u05E0\u05EA \u05D4\u05E9\u05D9\u05E2\u05D5\u05E8 \u2014 \u05E2\u05D1\u05D5\u05E8\u05D9")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))',
      gap: 12,
      marginTop: 12
    }
  }, link('toolkit', 'var(--green-100)', 'var(--green-700)', 'ערכת ההוראה', 'מערכי שיעור לשלוש רמות', 'toolkit'), link('printer', 'var(--orange-50)', 'var(--orange-600)', 'גליונות תרגול', 'להדפסה ולמסירה בשיעור', 'practice')), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 26
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "\u05DC\u05E9\u05DC\u05D9\u05D7\u05D4 \u05D5\u05DC\u05D4\u05D3\u05E4\u05E1\u05D4 \u05DC\u05DC\u05E7\u05D5\u05D7\u05D5\u05EA")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))',
      gap: 12,
      marginTop: 12
    }
  }, link('flier', 'var(--blue-100)', 'var(--blue-600)', 'הפלייר', 'להדפסה ולשליחה בוואטסאפ', 'flier'), link('image', 'var(--surface-muted)', 'var(--navy-800)', 'הפלייר כתמונה', 'לשליחה בקבוצות')), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '26px 0 12px'
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, {
    accent: "var(--blue-500)",
    rule: false
  }, "\u05D4\u05E9\u05D9\u05E2\u05D5\u05E8\u05D9\u05DD \u05D4\u05E9\u05D1\u05D5\u05E2")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 9
    }
  }, STUDENTS.filter(s => s.status === 'פעיל').slice(0, 4).map(s => /*#__PURE__*/React.createElement(ListRow, {
    key: s.id,
    leading: /*#__PURE__*/React.createElement(DateChip, {
      date: s.time,
      day: s.day
    }),
    title: s.name,
    meta: s.level + ' · ' + s.price,
    badge: s.paid ? /*#__PURE__*/React.createElement(Badge, {
      tone: "green",
      size: "sm"
    }, "\u05E9\u05D5\u05DC\u05DD") : /*#__PURE__*/React.createElement(Badge, {
      tone: "orange",
      size: "sm"
    }, "\u05DE\u05DE\u05EA\u05D9\u05DF \u05DC\u05EA\u05E9\u05DC\u05D5\u05DD"),
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "whatsapp",
      size: "sm",
      icon: "whatsapp"
    }, "\u05EA\u05D6\u05DB\u05D5\u05E8\u05EA"), /*#__PURE__*/React.createElement(IconButton, {
      icon: "calendar",
      title: "\u05E9\u05D9\u05E0\u05D5\u05D9 \u05DE\u05D5\u05E2\u05D3"
    }), /*#__PURE__*/React.createElement(IconButton, {
      icon: "close",
      tone: "danger",
      title: "\u05D1\u05D9\u05D8\u05D5\u05DC \u05D7\u05D3\u05BE\u05E4\u05E2\u05DE\u05D9"
    }))
  }))));
}
function StudentsTab() {
  const {
    SectionLabel,
    Button,
    TextField,
    DataTable,
    IconButton,
    Badge
  } = DS();
  const [q, setQ] = React.useState('');
  const rows = STUDENTS.filter(s => s.name.includes(q)).map(s => ({
    ...s,
    slot: s.day + ' · ' + s.time,
    statusCell: s.status === 'פעיל' ? /*#__PURE__*/React.createElement(Badge, {
      tone: "green",
      size: "sm"
    }, "\u05E4\u05E2\u05D9\u05DC") : /*#__PURE__*/React.createElement(Badge, {
      tone: "neutral",
      size: "sm"
    }, "\u05D4\u05E4\u05E1\u05E7\u05D4")
  }));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      flexWrap: 'wrap',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '0 0 4px',
      fontSize: 26,
      fontWeight: 800
    }
  }, "\u05EA\u05DC\u05DE\u05D9\u05D3\u05D5\u05EA"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 14.5,
      fontWeight: 500,
      color: 'var(--ink-6)'
    }
  }, STUDENTS.length, " \u05DB\u05E8\u05D8\u05D9\u05E1\u05D9\u05DD \xB7 5 \u05E4\u05E2\u05D9\u05DC\u05D9\u05DD")), /*#__PURE__*/React.createElement(Button, {
    icon: "plus"
  }, "\u05EA\u05DC\u05DE\u05D9\u05D3\u05D4 \u05D7\u05D3\u05E9\u05D4")), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 340,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(TextField, {
    shape: "pill",
    placeholder: "\u05D7\u05D9\u05E4\u05D5\u05E9...",
    value: q,
    onChange: e => setQ(e.target.value)
  })), /*#__PURE__*/React.createElement(DataTable, {
    columns: [{
      key: 'name',
      label: 'שם'
    }, {
      key: 'phone',
      label: 'טלפון'
    }, {
      key: 'level',
      label: 'רמה'
    }, {
      key: 'slot',
      label: 'לוז קבוע'
    }, {
      key: 'price',
      label: 'מחיר לשיעור'
    }, {
      key: 'statusCell',
      label: 'סטטוס'
    }],
    rows: rows,
    renderActions: () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(IconButton, {
      icon: "message",
      size: "sm",
      tone: "success",
      title: "\u05D5\u05D5\u05D0\u05D8\u05E1\u05D0\u05E4"
    }), /*#__PURE__*/React.createElement(IconButton, {
      icon: "edit",
      size: "sm",
      tone: "sunken",
      title: "\u05E2\u05E8\u05D9\u05DB\u05D4"
    }), /*#__PURE__*/React.createElement(IconButton, {
      icon: "trash",
      size: "sm",
      tone: "sunken",
      title: "\u05DE\u05D7\u05D9\u05E7\u05D4",
      style: {
        color: 'var(--red-500)'
      }
    }))
  }));
}
function PaymentsTab() {
  const {
    SectionLabel,
    StatCard,
    DataTable,
    IconButton,
    Badge,
    Button
  } = DS();
  const rows = PAYMENTS.map(p => ({
    ...p,
    stateCell: p.state === 'שולם' ? /*#__PURE__*/React.createElement(Badge, {
      tone: "green",
      size: "sm"
    }, "\u05E9\u05D5\u05DC\u05DD") : p.state === 'ממתין' ? /*#__PURE__*/React.createElement(Badge, {
      tone: "orange",
      size: "sm"
    }, "\u05DE\u05DE\u05EA\u05D9\u05DF") : /*#__PURE__*/React.createElement(Badge, {
      tone: "red",
      size: "sm"
    }, "\u05D1\u05D0\u05D9\u05D7\u05D5\u05E8")
  }));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      flexWrap: 'wrap',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '0 0 4px',
      fontSize: 26,
      fontWeight: 800
    }
  }, "\u05EA\u05E9\u05DC\u05D5\u05DE\u05D9\u05DD"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 14.5,
      fontWeight: 500,
      color: 'var(--ink-6)'
    }
  }, "\u05D0\u05D5\u05D2\u05D5\u05E1\u05D8 2026")), /*#__PURE__*/React.createElement(Button, {
    icon: "plus",
    color: "var(--green-700)"
  }, "\u05E8\u05D9\u05E9\u05D5\u05DD \u05EA\u05E9\u05DC\u05D5\u05DD")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(146px,1fr))',
      gap: 12,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "\u05E0\u05DB\u05E0\u05E1 \u05D4\u05D7\u05D5\u05D3\u05E9",
    value: "\u20AA1,200",
    sub: "2 \u05EA\u05E9\u05DC\u05D5\u05DE\u05D9\u05DD",
    color: "var(--green-700)"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "\u05DE\u05DE\u05EA\u05D9\u05DF",
    value: "\u20AA420",
    sub: "\u05E8\u05D7\u05DC \u05D0\u05D1\u05D9\u05D3\u05DF",
    color: "var(--orange-600)"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "\u05D1\u05D0\u05D9\u05D7\u05D5\u05E8",
    value: "\u20AA600",
    sub: "\u05E0\u05E2\u05DE\u05D9 \u05D2\u05DC \xB7 \u05D9\u05D5\u05DC\u05D9",
    color: "var(--red-600)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "\u05E8\u05D9\u05E9\u05D5\u05DE\u05D9\u05DD")), /*#__PURE__*/React.createElement(DataTable, {
    columns: [{
      key: 'name',
      label: 'תלמידה'
    }, {
      key: 'month',
      label: 'חודש'
    }, {
      key: 'lessons',
      label: 'שיעורים'
    }, {
      key: 'amount',
      label: 'סכום'
    }, {
      key: 'method',
      label: 'אמצעי'
    }, {
      key: 'stateCell',
      label: 'סטטוס'
    }],
    rows: rows,
    renderActions: () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(IconButton, {
      icon: "message",
      size: "sm",
      tone: "success",
      title: "\u05D1\u05E7\u05E9\u05EA \u05EA\u05E9\u05DC\u05D5\u05DD"
    }), /*#__PURE__*/React.createElement(IconButton, {
      icon: "edit",
      size: "sm",
      tone: "sunken",
      title: "\u05E2\u05E8\u05D9\u05DB\u05D4"
    }))
  }));
}
function ScheduleTab() {
  const {
    SectionLabel,
    ListRow,
    DateChip,
    Button,
    IconButton,
    EmptyState,
    Badge
  } = DS();
  const days = [['ראשון', STUDENTS.slice(0, 2)], ['שלישי', STUDENTS.slice(2, 5)], ['חמישי', STUDENTS.slice(5, 6)], ['שישי', []]];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      flexWrap: 'wrap',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '0 0 4px',
      fontSize: 26,
      fontWeight: 800
    }
  }, "\u05DC\u05D5\u05D6 \u05E9\u05D1\u05D5\u05E2\u05D9"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 14.5,
      fontWeight: 500,
      color: 'var(--ink-6)'
    }
  }, "6 \u05E9\u05D9\u05E2\u05D5\u05E8\u05D9\u05DD \u05E7\u05D1\u05D5\u05E2\u05D9\u05DD")), /*#__PURE__*/React.createElement(Button, {
    icon: "plus",
    color: "var(--orange-600)"
  }, "\u05E9\u05D9\u05E2\u05D5\u05E8 \u05D7\u05D3\u05BE\u05E4\u05E2\u05DE\u05D9")), days.map(([day, list]) => /*#__PURE__*/React.createElement("div", {
    key: day,
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, day), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 9,
      marginTop: 12
    }
  }, list.length ? list.map(s => /*#__PURE__*/React.createElement(ListRow, {
    key: s.id,
    leading: /*#__PURE__*/React.createElement(DateChip, {
      date: s.time,
      day: day.slice(0, 4),
      background: s.status === 'פעיל' ? 'var(--navy-800)' : 'var(--ink-7)'
    }),
    title: s.name,
    meta: s.level + ' · ' + s.phone,
    struck: s.status !== 'פעיל',
    titleColor: s.status !== 'פעיל' ? 'var(--ink-7)' : 'var(--ink-1)',
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "whatsapp",
      size: "sm",
      icon: "whatsapp"
    }, "\u05EA\u05D6\u05DB\u05D5\u05E8\u05EA"), /*#__PURE__*/React.createElement(IconButton, {
      icon: "calendar",
      title: "\u05E9\u05D9\u05E0\u05D5\u05D9 \u05DE\u05D5\u05E2\u05D3"
    }))
  })) : /*#__PURE__*/React.createElement(EmptyState, null, "\u05D0\u05D9\u05DF \u05E9\u05D9\u05E2\u05D5\u05E8\u05D9\u05DD \u05D1\u05D9\u05D5\u05DD \u05D6\u05D4. \u05D4\u05D5\u05E1\u05D9\u05E4\u05D9 \u05D9\u05D5\u05DD \u05D5\u05E9\u05E2\u05D4 \u05DC\u05EA\u05DC\u05DE\u05D9\u05D3/\u05D4 \u05D1\u05DB\u05E8\u05D8\u05D9\u05E1 \u05E9\u05DC\u05D4.")))));
}
function BusinessApp({
  go
}) {
  const {
    AppHeader,
    SyncStatus,
    HomeFab
  } = DS();
  const [tab, setTab] = React.useState('home');
  const tabs = [{
    id: 'home',
    label: 'בית'
  }, {
    id: 'students',
    label: 'תלמידות'
  }, {
    id: 'payments',
    label: 'תשלומים'
  }, {
    id: 'schedule',
    label: 'לוז שבועי'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100%',
      background: 'var(--surface-canvas)',
      paddingBottom: 50
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: () => go('home')
  }, /*#__PURE__*/React.createElement(HomeFab, {
    href: "#"
  })), /*#__PURE__*/React.createElement(AppHeader, {
    title: "\u05E0\u05D9\u05D4\u05D5\u05DC \u05D4\u05E2\u05E1\u05E7",
    subtitle: "\u05D8\u05E7 \u05D1\u05D2\u05D5\u05D1\u05D4 \u05D4\u05E2\u05D9\u05E0\u05D9\u05D9\u05DD \xB7 \u05D3\u05E0\u05D4 \u05E7\u05D5\u05E0\u05D9\u05E7",
    tabs: tabs,
    activeTab: tab,
    onTabChange: setTab,
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SyncStatus, {
      state: "synced",
      label: "\u05D2\u05D5\u05D1\u05D4 \u05DC\u05E4\u05E0\u05D9 3 \u05D3\u05E7\u05D5\u05EA",
      sub: "\u05D2\u05D9\u05D1\u05D5\u05D9 \u05DE\u05E7\u05D5\u05DE\u05D9"
    }), /*#__PURE__*/React.createElement(SyncStatus, {
      state: "synced",
      label: "Google Sheets",
      sub: "\u05E1\u05D5\u05E0\u05DB\u05E8\u05DF 09:12"
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--page-max-wide)',
      margin: '0 auto',
      padding: '22px var(--page-gutter) 0'
    }
  }, tab === 'home' && /*#__PURE__*/React.createElement(BusinessHome, {
    go: go,
    onTab: setTab
  }), tab === 'students' && /*#__PURE__*/React.createElement(StudentsTab, null), tab === 'payments' && /*#__PURE__*/React.createElement(PaymentsTab, null), tab === 'schedule' && /*#__PURE__*/React.createElement(ScheduleTab, null)));
}
Object.assign(window, {
  BusinessApp
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/tech-eye-level/BusinessApp.jsx", error: String((e && e.message) || e) }); }

// ui_kits/tech-eye-level/HomeHub.jsx
try { (() => {
function HomeHub({
  go
}) {
  const {
    Icon,
    Card,
    SectionLabel,
    Logo
  } = window.KunikDesignSystem_63ae72;
  const bullets = (items, color) => /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: 7
    }
  }, items.map(t => /*#__PURE__*/React.createElement("li", {
    key: t,
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 8,
      fontSize: 13.5,
      fontWeight: 600,
      color: 'var(--ink-4)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color,
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check-bold",
    size: 15
  })), t)));
  const big = o => /*#__PURE__*/React.createElement("a", {
    onClick: e => {
      e.preventDefault();
      go(o.to);
    },
    href: "#",
    className: "lift",
    style: {
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-18)',
      padding: '26px 24px',
      textDecoration: 'none',
      color: 'var(--ink-1)',
      boxShadow: 'var(--shadow-card)',
      border: '1px solid var(--border-card)',
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 52,
      height: 52,
      borderRadius: 'var(--radius-14)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: o.bg,
      color: o.fg,
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: o.icon,
    size: 26
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 800,
      padding: '5px 10px',
      borderRadius: 'var(--radius-pill)',
      letterSpacing: '.2px',
      background: o.bg,
      color: o.fg
    }
  }, o.tag)), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 19,
      fontWeight: 800
    }
  }, o.title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--ink-6)',
      lineHeight: 1.5
    }
  }, o.blurb), bullets(o.items, o.fg), /*#__PURE__*/React.createElement("span", {
    style: {
      marginTop: 'auto',
      paddingTop: 4,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 14,
      fontWeight: 700,
      color: o.fg
    }
  }, o.cta, /*#__PURE__*/React.createElement("span", {
    style: {
      transform: 'scaleX(-1)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left",
    size: 16
  }))));
  const small = (icon, title, sub, to) => /*#__PURE__*/React.createElement("a", {
    onClick: e => {
      e.preventDefault();
      to && go(to);
    },
    href: "#",
    style: {
      flex: '1 1 220px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      background: 'var(--surface-card)',
      border: '1px solid var(--border-card)',
      borderRadius: 'var(--radius-14)',
      padding: '14px 16px',
      textDecoration: 'none',
      color: 'var(--ink-1)',
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 'var(--radius-10)',
      background: 'var(--surface-sunken)',
      color: 'var(--ink-5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 18
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      fontSize: 14,
      fontWeight: 700
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 500,
      color: 'var(--ink-7)'
    }
  }, sub)));
  const LESSONS = [['ראשון', [['10:00', 'מרים כהן'], ['16:30', 'יהודית ברק']]], ['שלישי', [['09:30', 'רחל אבידן'], ['11:00', 'שרה מזרחי'], ['17:00', 'נעמי גל']]], ['חמישי', [['10:30', 'אסתר פרידמן']]]];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-canvas)',
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      background: 'var(--navy-800)',
      color: '#fff',
      padding: '44px 24px 40px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      backgroundImage: 'radial-gradient(rgba(255,255,255,.05) 1px, transparent 1px)',
      backgroundSize: '22px 22px',
      opacity: .5
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      maxWidth: 640,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    height: 34
  })), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '0 0 10px',
      fontSize: 32,
      fontWeight: 800
    }
  }, "\u05D8\u05E7 \u05D1\u05D2\u05D5\u05D1\u05D4 \u05D4\u05E2\u05D9\u05E0\u05D9\u05D9\u05DD"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 14px',
      fontSize: 15,
      fontWeight: 500,
      color: 'var(--blue-300)',
      letterSpacing: '.3px'
    }
  }, "\u05D3\u05E0\u05D4 \u05E7\u05D5\u05E0\u05D9\u05E7 \xB7 \u05E9\u05D9\u05E2\u05D5\u05E8\u05D9 \u05D8\u05DB\u05E0\u05D5\u05DC\u05D5\u05D2\u05D9\u05D4 \u05DC\u05D2\u05D9\u05DC \u05D4\u05E9\u05DC\u05D9\u05E9\u05D9"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 14.5,
      fontWeight: 500,
      color: 'var(--blue-150)',
      lineHeight: 1.6
    }
  }, "\u05DB\u05DC \u05D4\u05DB\u05DC\u05D9\u05DD \u05DC\u05E0\u05D9\u05D4\u05D5\u05DC \u05D4\u05E2\u05E1\u05E7 \u05D5\u05DC\u05DC\u05D9\u05DE\u05D5\u05D3 \u2014 \u05D1\u05DE\u05E7\u05D5\u05DD \u05D0\u05D7\u05D3. \u05D1\u05D7\u05E8\u05D9 \u05DC\u05D0\u05DF \u05DC\u05D4\u05D9\u05DB\u05E0\u05E1."))), /*#__PURE__*/React.createElement("main", {
    style: {
      width: '100%',
      maxWidth: 760,
      padding: '36px 20px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 18
    }
  }, big({
    to: 'business',
    icon: 'bars',
    bg: 'var(--blue-100)',
    fg: 'var(--blue-600)',
    tag: 'לשימוש יומיומי',
    title: 'ניהול העסק',
    blurb: 'כל מה שצריך כדי לנהל את השיעורים בלי להתבלבל.',
    cta: 'כניסה לניהול העסק',
    items: ['תלמידות, טלפונים ומחירים', 'תשלומים ומעקב חודשי', 'לוז שבועי ותזכורות בוואטסאפ', 'סנכרון אוטומטי בין הטלפון והמחשב']
  }), big({
    to: 'toolkit',
    icon: 'book',
    bg: 'var(--green-100)',
    fg: 'var(--green-700)',
    tag: 'להכנת שיעור',
    title: 'ערכת ההוראה',
    blurb: 'מערכי שיעור מוכנים, לפי רמת התלמיד/ה.',
    cta: 'כניסה לערכת ההוראה',
    items: ['שלוש רמות: מתחיל, בינוני, מתקדם', 'שלב אחר שלב, מוכן להוראה', 'נושאים: סמארטפון, מחשב, בינה מלאכותית', 'מתחבר לגליונות התרגול להדפסה']
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 34
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: 'var(--ink-6)',
      letterSpacing: '.4px',
      margin: '0 0 12px'
    }
  }, "\u05D7\u05D5\u05DE\u05E8\u05D9\u05DD \u05E0\u05D5\u05E1\u05E4\u05D9\u05DD"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, small('printer', 'גליונות תרגול', 'להדפסה ולתרגול בשיעור', 'practice'), small('flier', 'הפלייר', 'להדפסה ולשליחה בוואטסאפ', 'flier'), small('slides', 'המצגת השיווקית', 'להצגה בפני לקוחות פוטנציאליים'))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 34,
      paddingBottom: 40
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: 'var(--ink-6)',
      letterSpacing: '.4px',
      margin: '0 0 12px'
    }
  }, "\u05D4\u05E9\u05D9\u05E2\u05D5\u05E8\u05D9\u05DD \u05D4\u05E9\u05D1\u05D5\u05E2"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-card)',
      borderRadius: 'var(--radius-18)',
      boxShadow: 'var(--shadow-card)',
      overflow: 'hidden'
    }
  }, LESSONS.map(([day, rows]) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: day
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 20px',
      background: 'var(--surface-sunken)',
      fontSize: 13,
      fontWeight: 800,
      color: 'var(--navy-800)',
      borderBottom: '1px solid var(--border-card)',
      borderTop: '1px solid var(--border-card)'
    }
  }, day), rows.map(([time, name]) => /*#__PURE__*/React.createElement("div", {
    key: name,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '13px 20px',
      borderBottom: '1px solid var(--border-hair)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-num)',
      fontSize: 14,
      fontWeight: 700,
      color: 'var(--ink-6)',
      flex: 'none',
      width: 46
    }
  }, time), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 14.5,
      fontWeight: 700
    }
  }, name), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: 'var(--green-100)',
      color: 'var(--green-700)',
      fontWeight: 800,
      fontSize: 13,
      padding: '8px 14px',
      borderRadius: 'var(--radius-pill)'
    }
  }, "\u05EA\u05D6\u05DB\u05D5\u05E8\u05EA")))))))), /*#__PURE__*/React.createElement("footer", {
    style: {
      margin: '0 0 28px',
      fontSize: 12.5,
      fontWeight: 500,
      color: 'var(--ink-8)'
    }
  }, "\u05D8\u05E7 \u05D1\u05D2\u05D5\u05D1\u05D4 \u05D4\u05E2\u05D9\u05E0\u05D9\u05D9\u05DD \xB7 \u05D3\u05E0\u05D4 \u05E7\u05D5\u05E0\u05D9\u05E7"));
}
Object.assign(window, {
  HomeHub
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/tech-eye-level/HomeHub.jsx", error: String((e && e.message) || e) }); }

// ui_kits/tech-eye-level/PrintDocs.jsx
try { (() => {
const SHEET = {
  title: 'רמה 1 — סמארטפון, יסודות',
  color: 'var(--blue-500)',
  sheets: [{
    n: 1,
    title: 'מסך מגע בסיסי',
    sub: 'לאחר שיעור 1',
    tip: 'אי אפשר "לשבור" טלפון בלחיצה. נסי בחופשיות!',
    tasks: ['לחצי על שעון הטלפון כדי לפתוח אותו', 'גללי למטה ולמעלה במסך הבית', 'לחצי על "הגדרות" ואז על כפתור "חזרה"', 'הגדילי טקסט: לחצי פעמיים על אתר חדשות']
  }, {
    n: 2,
    title: 'שיחות טלפון',
    sub: 'לאחר שיעור 2',
    tasks: ['חייגי לבן/בת משפחה שיודע/ת שאת מתרגלת', 'שמרי מספר חדש באנשי קשר בשם "רופא משפחה"', 'מצאי שיחה מאתמול בהיסטוריית השיחות']
  }, {
    n: 3,
    title: 'WhatsApp',
    sub: 'לאחר שיעורים 3–4',
    tip: 'שני ✓✓ כחולים = נקראה. ✓✓ אפורים = נשלחה אך לא נקראה.',
    tasks: ['שלחי הודעת "שלום!" לקרוב משפחה', 'שלחי תמונה מהגלריה', 'שלחי הודעה קולית', 'השתיקי קבוצה רועשת (8 שעות)']
  }]
};
function PaperSheet({
  children,
  width = 794
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      minHeight: 1050,
      background: '#fff',
      boxShadow: 'var(--shadow-print)',
      borderRadius: 4,
      padding: '30px 44px 44px',
      margin: '0 auto'
    }
  }, children);
}
function PracticeSheet() {
  const {
    Checkbox,
    Callout,
    Logo
  } = window.KunikDesignSystem_63ae72;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-canvas)',
      padding: '28px 20px 48px'
    }
  }, /*#__PURE__*/React.createElement(PaperSheet, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 14,
      paddingBottom: 8,
      borderBottom: '1px solid var(--border-field)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    height: 16,
    onNavy: false
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: 'var(--navy-800)'
    }
  }, "\u05D8\u05E7 \u05D1\u05D2\u05D5\u05D1\u05D4 \u05D4\u05E2\u05D9\u05E0\u05D9\u05D9\u05DD \xB7 \u05D3\u05E0\u05D4 \u05E7\u05D5\u05E0\u05D9\u05E7")), /*#__PURE__*/React.createElement("div", {
    dir: "ltr",
    style: {
      fontFamily: 'var(--font-num)',
      fontSize: 12,
      fontWeight: 700,
      color: 'var(--ink-6)'
    }
  }, "053-700-4934")), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 34
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      letterSpacing: '2px',
      color: 'var(--blue-500)'
    }
  }, "\u05D2\u05DC\u05D9\u05D5\u05E0\u05D5\u05EA \u05EA\u05E8\u05D2\u05D5\u05DC \u05DC\u05D1\u05D9\u05EA"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 34,
      lineHeight: 1.15,
      fontWeight: 800,
      letterSpacing: '-1px',
      color: 'var(--navy-800)',
      marginTop: 6
    }
  }, SHEET.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      lineHeight: 1.6,
      color: 'var(--ink-3)',
      marginTop: 10,
      fontWeight: 500,
      maxWidth: '80%'
    }
  }, "\u05E1\u05DE\u05E0\u05D5 \u2713 \u05D1\u05DB\u05DC \u05DE\u05E9\u05D9\u05DE\u05D4 \u05E9\u05D4\u05E6\u05DC\u05D7\u05EA\u05DD. \u05D0\u05D9\u05DF \u05E6\u05D5\u05E8\u05DA \u05DC\u05E1\u05D9\u05D9\u05DD \u05D4\u05DB\u05DC \u2014 \u05DB\u05DC \u05DE\u05E9\u05D9\u05DE\u05D4 \u05E9\u05E2\u05E9\u05D9\u05EA\u05DD \u05D4\u05D9\u05D0 \u05D4\u05EA\u05E7\u05D3\u05DE\u05D5\u05EA. \u05E0\u05EA\u05E7\u05E2\u05EA\u05DD? \u05E6\u05DC\u05DE\u05D5 \u05D0\u05EA \u05D4\u05DE\u05E1\u05DA \u05D5\u05E9\u05DC\u05D7\u05D5 \u05DC\u05D9 \u05D1-WhatsApp.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '11px 16px',
      borderRadius: 'var(--radius-8)',
      background: SHEET.color,
      color: '#fff',
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-num)',
      fontSize: 15,
      fontWeight: 900
    }
  }, "\u05E8\u05DE\u05D4 1"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700
    }
  }, "\u05E1\u05DE\u05D0\u05E8\u05D8\u05E4\u05D5\u05DF \u2014 \u05D9\u05E1\u05D5\u05D3\u05D5\u05EA")), SHEET.sheets.map(sh => /*#__PURE__*/React.createElement("div", {
    key: sh.n,
    style: {
      border: '1px solid var(--border-field)',
      borderRadius: 'var(--radius-10)',
      padding: '16px 18px',
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 'none',
      width: 32,
      height: 32,
      borderRadius: 'var(--radius-8)',
      background: SHEET.color,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-num)',
      fontSize: 15,
      fontWeight: 800
    }
  }, sh.n), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 800,
      lineHeight: 1.3
    }
  }, sh.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--ink-6)'
    }
  }, sh.sub))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7,
      marginTop: 12
    }
  }, sh.tasks.map(t => /*#__PURE__*/React.createElement(Checkbox, {
    key: t,
    size: "print",
    label: t
  }))), sh.tip && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(Callout, {
    tone: "tip",
    label: "\u05D8\u05D9\u05E4"
  }, sh.tip)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 22,
      padding: '16px 18px',
      borderRadius: 'var(--radius-10)',
      background: 'var(--blue-100)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      lineHeight: 1.5,
      fontWeight: 700,
      color: 'var(--blue-600)'
    }
  }, "\u05E0\u05EA\u05E7\u05E2\u05EA? \u05D0\u05DC \u05EA\u05D9\u05E9\u05D0\u05E8\u05D9 \u05E2\u05DD \u05D4\u05E9\u05D0\u05DC\u05D4 \u2014 \u05DB\u05EA\u05D1\u05D9 \u05DC\u05D9 \u05D5\u05D0\u05D7\u05D6\u05D5\u05E8 \u05D0\u05DC\u05D9\u05DA."), /*#__PURE__*/React.createElement("div", {
    dir: "ltr",
    style: {
      fontFamily: 'var(--font-num)',
      fontSize: 23,
      fontWeight: 900,
      color: 'var(--navy-800)',
      whiteSpace: 'nowrap'
    }
  }, "053-700-4934"))));
}
function Flier() {
  const {
    Icon
  } = window.KunikDesignSystem_63ae72;
  const topics = [['smartphone', 'סמארטפון', 'WhatsApp, מצלמה, ניווט ועוד'], ['computer', 'מחשב ואינטרנט', 'מייל, הזמנות, קופ"ח'], ['video', 'שיחות וידאו', 'Zoom ו-FaceTime'], ['sparkles', 'בינה מלאכותית', 'ChatGPT ועוד']];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-canvas)',
      padding: '28px 20px 48px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 794,
      minHeight: 1123,
      margin: '0 auto',
      background: 'var(--surface-canvas)',
      boxShadow: 'var(--shadow-print)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      borderRadius: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      padding: '44px 48px 104px',
      background: 'var(--hero-gradient)',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      opacity: .14,
      backgroundImage: 'radial-gradient(#fff 1.2px,transparent 1.2px)',
      backgroundSize: '24px 24px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 3,
      height: 26
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 8,
      height: 12,
      borderRadius: 2,
      background: 'var(--blue-300)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 8,
      height: 19,
      borderRadius: 2,
      background: 'var(--blue-400)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 8,
      height: 26,
      borderRadius: 2,
      background: '#fff'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 800,
      letterSpacing: '.6px'
    }
  }, "\u05D8\u05E7 \u05D1\u05D2\u05D5\u05D1\u05D4 \u05D4\u05E2\u05D9\u05E0\u05D9\u05D9\u05DD")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      color: 'var(--blue-300)'
    }
  }, "\u05E8\u05DE\u05EA \u05D4\u05E9\u05E8\u05D5\u05DF \u05D5\u05D4\u05E1\u05D1\u05D9\u05D1\u05D4")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: 32,
      marginTop: 44
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 'none',
      width: 206,
      height: 206,
      borderRadius: '50%',
      overflow: 'hidden',
      border: '5px solid rgba(255,255,255,.9)',
      boxShadow: 'var(--shadow-portrait)',
      background: 'var(--border-field)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/dana-portrait.png",
    alt: "\u05D3\u05E0\u05D4 \u05E7\u05D5\u05E0\u05D9\u05E7",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: '50% 18%',
      display: 'block'
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      letterSpacing: '2.4px',
      color: 'var(--blue-300)'
    }
  }, "\u05D3\u05E0\u05D4 \u05E7\u05D5\u05E0\u05D9\u05E7"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 62,
      lineHeight: 1.04,
      fontWeight: 800,
      letterSpacing: '-1.6px',
      marginTop: 6
    }
  }, "\u05E9\u05D9\u05E2\u05D5\u05E8\u05D9 \u05D8\u05DB\u05E0\u05D5\u05DC\u05D5\u05D2\u05D9\u05D4 \u05D0\u05E6\u05DC\u05DB\u05DD"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 23,
      fontWeight: 600,
      color: 'var(--blue-120)',
      marginTop: 12
    }
  }, "\u05D1\u05D1\u05D9\u05EA \u05E9\u05DC\u05DB\u05DD, \u05D1\u05E7\u05E6\u05D1 \u05E9\u05DC\u05DB\u05DD")))), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '-70px 34px 0',
      padding: '38px 34px 34px',
      background: '#fff',
      borderRadius: 'var(--radius-16)',
      boxShadow: 'var(--shadow-print)',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 24,
      lineHeight: 1.62,
      color: 'var(--ink-2)'
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--blue-600)'
    }
  }, "\u05D4\u05E1\u05DE\u05D0\u05E8\u05D8\u05E4\u05D5\u05DF"), " \u05DE\u05D1\u05DC\u05D1\u05DC? ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--blue-600)'
    }
  }, "\u05D1\u05D0 \u05DC\u05DB\u05DD \u05DC\u05D3\u05D1\u05E8 \u05E2\u05DD \u05D4\u05E0\u05DB\u05D3\u05D9\u05DD \u05D1\u05D5\u05D5\u05D9\u05D3\u05D0\u05D5"), " \u05D0\u05D1\u05DC \u05DC\u05D0 \u05D9\u05D5\u05D3\u05E2\u05D9\u05DD \u05D0\u05D9\u05DA? ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--blue-600)'
    }
  }, "\u05E8\u05D5\u05E6\u05D9\u05DD \u05DC\u05D4\u05D6\u05DE\u05D9\u05DF \u05EA\u05E8\u05D5\u05E4\u05D5\u05EA \u05DE\u05D4\u05D1\u05D9\u05EA"), " \u05D1\u05DC\u05D9 \u05DC\u05E6\u05D0\u05EA?"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      padding: '12px 18px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--blue-100)',
      color: 'var(--blue-600)',
      fontSize: 19,
      fontWeight: 700
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 19
  }), "\u05D0\u05E0\u05D9 \u05D1\u05D0\u05D4 \u05D0\u05DC\u05D9\u05DB\u05DD, \u05D1\u05DC\u05D9 \u05DC\u05D7\u05E5, \u05D1\u05E7\u05E6\u05D1 \u05E9\u05DC\u05DB\u05DD")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 14
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 34px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      margin: '0 4px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      height: 2,
      background: 'var(--blue-500)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 800,
      letterSpacing: '1.8px',
      color: 'var(--navy-800)'
    }
  }, "\u05DE\u05D4 \u05DC\u05D5\u05DE\u05D3\u05D9\u05DD \u05D0\u05D9\u05EA\u05D9")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14
    }
  }, topics.map(([ic, t, s]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '26px 20px',
      borderRadius: 'var(--radius-12)',
      background: '#fff',
      border: '1px solid var(--border-card)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 'none',
      width: 50,
      height: 50,
      borderRadius: '50%',
      background: 'var(--navy-800)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    size: 25,
    strokeWidth: 1.6
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800
    }
  }, t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      color: 'var(--ink-6)',
      marginTop: 2
    }
  }, s)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 14
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 34px 34px',
      borderRadius: 'var(--radius-16)',
      background: 'var(--navy-800)',
      color: '#fff',
      padding: '26px 30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      letterSpacing: '1.4px',
      color: 'var(--blue-300)'
    }
  }, "\u05E9\u05D9\u05E2\u05D5\u05E8\u05D9\u05DD \u05D1\u05D1\u05D9\u05EA \u05D4\u05DC\u05E7\u05D5\u05D7/\u05EA"), /*#__PURE__*/React.createElement("div", {
    dir: "ltr",
    style: {
      fontFamily: 'var(--font-num)',
      fontSize: 42,
      fontWeight: 900,
      letterSpacing: '-1.4px',
      marginTop: 2,
      color: '#fff'
    }
  }, "053-700-4934")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '17px 24px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--whatsapp)',
      color: 'var(--whatsapp-ink)',
      fontSize: 20,
      fontWeight: 800
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "whatsapp",
    size: 25
  }), "\u05DB\u05EA\u05D1\u05D5 \u05DC\u05D9"))));
}
Object.assign(window, {
  PracticeSheet,
  Flier
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/tech-eye-level/PrintDocs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/tech-eye-level/TeachingToolkit.jsx
try { (() => {
const PLANS = {
  1: [{
    badge: 'שיעור 1',
    title: 'מסך מגע והיכרות עם המכשיר',
    dur: '45 דקות',
    goal: 'התלמידה פותחת ונועלת את הטלפון בביטחון',
    materials: 'טלפון של התלמידה, גליון תרגול 1',
    phases: [{
      name: 'פתיחה',
      time: '5 דק׳',
      dot: 'var(--blue-300)',
      steps: ['שאלי מה הכי מפריע לה בטלפון היום', 'הסבירי שאי אפשר לשבור כלום בלחיצה']
    }, {
      name: 'הדגמה',
      time: '15 דק׳',
      dot: 'var(--blue-500)',
      steps: ['הדליקי והנעילי את המסך יחד', 'הראי את כפתור הבית ואת כפתור החזרה', 'גללי למעלה ולמטה במסך הבית']
    }, {
      name: 'תרגול',
      time: '20 דק׳',
      dot: 'var(--green-500)',
      steps: ['בקשי ממנה לפתוח שלוש אפליקציות ולחזור', 'הגדילו יחד את גודל הטקסט בהגדרות']
    }, {
      name: 'סיכום',
      time: '5 דק׳',
      dot: 'var(--orange-500)',
      steps: ['חזרי על מה שלמדנו במילים שלה', 'מסרי את גליון התרגול']
    }],
    tip: 'אם היא מתביישת — תני לה להחזיק את הטלפון כל הזמן. את רק מצביעה.',
    hw: ['לחצי על שעון הטלפון כדי לפתוח אותו', 'פתחי הגדרות וחזרי אחורה', 'הגדילי טקסט באתר חדשות']
  }, {
    badge: 'שיעור 2',
    title: 'שיחות טלפון ואנשי קשר',
    dur: '45 דקות',
    goal: 'שמירת מספר חדש וחיוג ממנו',
    phases: [{
      name: 'פתיחה',
      time: '5 דק׳',
      dot: 'var(--blue-300)',
      steps: ['בדקי מה נשאר מהשיעור הקודם']
    }, {
      name: 'הדגמה',
      time: '15 דק׳',
      dot: 'var(--blue-500)',
      steps: ['פתחי את אפליקציית הטלפון', 'שמרי מספר חדש בשם "רופא משפחה"']
    }, {
      name: 'תרגול',
      time: '20 דק׳',
      dot: 'var(--green-500)',
      steps: ['היא מחייגת לבן משפחה שמחכה לשיחה', 'מצאו יחד שיחה מאתמול בהיסטוריה']
    }],
    warn: 'אל תשמרי מספרים בשמות מקוצרים — שם מלא בלבד, אחרת היא לא תמצא.',
    hw: ['חייגי לבן/בת משפחה', 'שמרי מספר חדש', 'מצאי שיחה מאתמול']
  }],
  2: [{
    badge: 'שיעור 1',
    title: 'מייל — לפתוח, לקרוא, לענות',
    dur: '50 דקות',
    goal: 'שליחת מייל וזיהוי השולח',
    materials: 'מחשב או טאבלט',
    phases: [{
      name: 'פתיחה',
      time: '5 דק׳',
      dot: 'var(--blue-300)',
      steps: ['שאלי מתי בפעם האחרונה פתחה מייל']
    }, {
      name: 'הדגמה',
      time: '20 דק׳',
      dot: 'var(--blue-500)',
      steps: ['פתחו את תיבת הדואר יחד', 'הראי איפה רואים מי שלח']
    }, {
      name: 'תרגול',
      time: '25 דק׳',
      dot: 'var(--green-500)',
      steps: ['היא שולחת מייל לעצמה עם נושא "בדיקה"', 'העבירו מייל ספאם לתיקיית דואר זבל']
    }],
    tip: 'לעולם לא ללחוץ על קישורים ממיילים ממוסדות בנקאיים.',
    hw: ['שלחי מייל לעצמך', 'בדקי מי שלח מייל שקיבלת']
  }],
  3: [{
    badge: 'שיעור 1',
    title: 'בינה מלאכותית — שיחה ראשונה',
    dur: '50 דקות',
    goal: 'לשאול שאלה אחת ולקבל תשובה מובנת',
    phases: [{
      name: 'פתיחה',
      time: '5 דק׳',
      dot: 'var(--blue-300)',
      steps: ['הסבירי מה זה AI במשפט אחד, בלי ז׳רגון']
    }, {
      name: 'הדגמה',
      time: '15 דק׳',
      dot: 'var(--blue-500)',
      steps: ['שאלי: "תן לי מתכון קל לסלט ירקות"', 'הראי איך מבקשים "תסביר לי פשוט יותר"']
    }, {
      name: 'תרגול',
      time: '25 דק׳',
      dot: 'var(--green-500)',
      steps: ['היא שואלת שאלה שמסקרנת אותה', 'תרגמו יחד משפט מאנגלית']
    }],
    tip: 'AI לא תמיד צודק — תמיד אפשר לבדוק במקור נוסף.',
    hw: ['שאלי שאלה שמעניינת אותך', 'בקשי מכתב קצר לרופא']
  }]
};
const PRACTICE = {
  1: [{
    n: 1,
    title: 'מסך מגע בסיסי',
    sub: 'לאחר שיעור 1',
    tip: 'אי אפשר "לשבור" טלפון בלחיצה. נסי בחופשיות!',
    tasks: ['לחצי על שעון הטלפון כדי לפתוח אותו', 'גללי למטה ולמעלה במסך הבית', 'לחצי על "הגדרות" ואז על כפתור "חזרה"']
  }, {
    n: 3,
    title: 'WhatsApp',
    sub: 'לאחר שיעורים 3–4',
    tip: 'שני ✓✓ כחולים = נקראה. ✓✓ אפורים = נשלחה אך לא נקראה.',
    tasks: ['שלחי הודעת "שלום!" לקרוב משפחה', 'שלחי תמונה מהגלריה', 'שלחי הודעה קולית']
  }],
  2: [{
    n: 3,
    title: 'אבטחה דיגיטלית',
    sub: 'לאחר שיעור 5 · בחני את עצמך',
    tip: 'שום גוף רשמי לא יבקש ממך לשלוח קוד SMS!',
    tasks: ['קיבלתי SMS שמבקש קוד בנקאי – זו הונאה, לא לענות', 'מישהו ב-WA טוען שהוא נכד בצרות – להתקשר ישירות']
  }],
  3: [{
    n: 8,
    title: 'הגדרות נגישות',
    sub: 'שווה לכל תלמיד/ה',
    tip: 'זו ההגדרה שהופכת את הטלפון מ"קשה" ל"נוח" בבת אחת.',
    tasks: ['הגדילי את גודל הטקסט בכל המכשיר', 'הפעילי "טקסט מודגש" לקריאה נוחה']
  }]
};
const LEVEL_COLOR = {
  1: 'var(--blue-500)',
  2: 'var(--green-500)',
  3: 'var(--orange-500)'
};
const LEVEL_LABEL = {
  1: 'רמה 1 — סמארטפון',
  2: 'רמה 2 — מחשב ואבטחה',
  3: 'רמה 3 — AI ווידאו'
};
function PlanCard({
  plan,
  color,
  open,
  onToggle
}) {
  const {
    Icon,
    Callout
  } = window.KunikDesignSystem_63ae72;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-card)',
      borderRadius: 'var(--radius-14)',
      marginBottom: 12,
      boxShadow: 'var(--shadow-card)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onToggle,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '17px 20px',
      cursor: 'pointer',
      userSelect: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 'none',
      padding: '6px 13px',
      borderRadius: 'var(--radius-8)',
      background: color,
      color: '#fff',
      fontSize: 13.5,
      fontWeight: 800,
      whiteSpace: 'nowrap'
    }
  }, plan.badge), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 19,
      fontWeight: 800,
      lineHeight: 1.3
    }
  }, plan.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--ink-6)'
    }
  }, plan.dur)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 'none',
      color: 'var(--ink-7)',
      transform: open ? 'rotate(180deg)' : 'none',
      transition: 'var(--transition-chevron)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-down",
    size: 20
  }))), open && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 20,
      borderTop: '1px solid var(--border-hair)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      padding: '10px 15px',
      borderRadius: 'var(--radius-10)',
      background: 'var(--green-100)',
      color: 'var(--green-700)',
      fontSize: 15.5,
      fontWeight: 700
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "target",
    size: 17
  }), plan.goal), plan.materials && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      padding: '10px 15px',
      borderRadius: 'var(--radius-10)',
      background: 'var(--surface-muted)',
      color: 'var(--ink-3)',
      fontSize: 15.5,
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "materials",
    size: 17,
    style: {
      color: 'var(--navy-800)'
    }
  }), plan.materials)), plan.phases.map(ph => /*#__PURE__*/React.createElement("div", {
    key: ph.name,
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      marginBottom: 9
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: ph.dot
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 800
    }
  }, ph.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--ink-7)'
    }
  }, ph.time)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7
    }
  }, ph.steps.map(s => /*#__PURE__*/React.createElement("div", {
    key: s,
    style: {
      display: 'flex',
      gap: 11,
      padding: '11px 14px',
      borderRadius: 'var(--radius-9)',
      background: 'var(--surface-sunken)',
      lineHeight: 1.5,
      fontWeight: 500,
      fontSize: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 'none',
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: 'var(--blue-300)',
      marginTop: 8
    }
  }), /*#__PURE__*/React.createElement("div", null, s)))))), plan.warn && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Callout, {
    tone: "warn"
  }, plan.warn)), plan.tip && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Callout, {
    tone: "info"
  }, plan.tip)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 18px',
      borderRadius: 'var(--radius-12)',
      background: 'var(--surface-sunken)',
      border: '1px solid var(--border-card)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      marginBottom: 11
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "home",
    size: 18,
    style: {
      color: 'var(--navy-800)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 800,
      letterSpacing: '1px',
      color: 'var(--navy-800)'
    }
  }, "\u05E9\u05D9\u05E2\u05D5\u05E8\u05D9 \u05D1\u05D9\u05EA")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, plan.hw.map(h => /*#__PURE__*/React.createElement("div", {
    key: h,
    style: {
      display: 'flex',
      gap: 10,
      fontSize: 16,
      lineHeight: 1.5,
      fontWeight: 600,
      color: 'var(--ink-2)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-left",
    size: 17,
    style: {
      color: 'var(--blue-500)',
      marginTop: 3
    }
  }), /*#__PURE__*/React.createElement("div", null, h)))))));
}
function TeachingToolkit({
  go
}) {
  const {
    AppHeader,
    SyncStatus,
    HomeFab,
    LevelPill,
    SectionLabel,
    Checkbox,
    Callout,
    Card,
    Icon
  } = window.KunikDesignSystem_63ae72;
  const [tab, setTab] = React.useState('plans');
  const [level, setLevel] = React.useState(1);
  const [open, setOpen] = React.useState(0);
  const [done, setDone] = React.useState({});
  const color = LEVEL_COLOR[level];
  const sheets = PRACTICE[level] || [];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100%',
      background: 'var(--surface-canvas)',
      paddingBottom: 60
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: () => go('home')
  }, /*#__PURE__*/React.createElement(HomeFab, {
    href: "#"
  })), /*#__PURE__*/React.createElement(AppHeader, {
    title: "\u05E2\u05E8\u05DB\u05EA \u05D4\u05D4\u05D5\u05E8\u05D0\u05D4",
    subtitle: "\u05E9\u05D9\u05E2\u05D5\u05E8\u05D9 \u05D8\u05DB\u05E0\u05D5\u05DC\u05D5\u05D2\u05D9\u05D4 \u05DC\u05D2\u05D9\u05DC \u05D4\u05E9\u05DC\u05D9\u05E9\u05D9 \xB7 \u05D3\u05E0\u05D4 \u05E7\u05D5\u05E0\u05D9\u05E7",
    maxWidth: "var(--page-max)",
    tabs: [{
      id: 'plans',
      label: 'מערכי שיעור'
    }, {
      id: 'practice',
      label: 'גליונות תרגול'
    }, {
      id: 'summary',
      label: 'סיכום שיעור'
    }],
    activeTab: tab,
    onTabChange: setTab,
    actions: /*#__PURE__*/React.createElement(SyncStatus, {
      state: "synced",
      label: "\u05D2\u05D5\u05D1\u05D4 \u05DC\u05E4\u05E0\u05D9 6 \u05D3\u05E7\u05D5\u05EA",
      sub: "\u05E0\u05E9\u05DE\u05E8 \u05D1\u05DE\u05DB\u05E9\u05D9\u05E8"
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--page-max)',
      margin: '0 auto',
      padding: '22px 24px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
      marginBottom: 20
    }
  }, [1, 2, 3].map(n => /*#__PURE__*/React.createElement(LevelPill, {
    key: n,
    label: LEVEL_LABEL[n],
    color: LEVEL_COLOR[n],
    selected: level === n,
    onClick: () => {
      setLevel(n);
      setOpen(0);
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--ink-6)'
    }
  }, (PLANS[level] || []).length, " \u05DE\u05E2\u05E8\u05DB\u05D9 \u05E9\u05D9\u05E2\u05D5\u05E8")), tab === 'plans' && (PLANS[level] || []).map((p, i) => /*#__PURE__*/React.createElement(PlanCard, {
    key: p.badge,
    plan: p,
    color: color,
    open: open === i,
    onToggle: () => setOpen(open === i ? -1 : i)
  })), tab === 'practice' && sheets.map(sh => /*#__PURE__*/React.createElement("div", {
    key: sh.n,
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-card)',
      borderRadius: 'var(--radius-14)',
      padding: '18px 20px',
      marginBottom: 12,
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 'none',
      width: 40,
      height: 40,
      borderRadius: 'var(--radius-10)',
      background: color,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-num)',
      fontSize: 17,
      fontWeight: 800
    }
  }, sh.n), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 19,
      fontWeight: 800,
      lineHeight: 1.3
    }
  }, sh.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--ink-6)'
    }
  }, sh.sub)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color
    }
  }, sh.tasks.filter(t => done[t]).length, "/", sh.tasks.length)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      marginTop: 16
    }
  }, sh.tasks.map(t => /*#__PURE__*/React.createElement(Checkbox, {
    key: t,
    label: t,
    color: color,
    checked: !!done[t],
    onClick: () => setDone({
      ...done,
      [t]: !done[t]
    })
  }))), sh.tip && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(Callout, {
    tone: "tip"
  }, sh.tip)))), tab === 'summary' && /*#__PURE__*/React.createElement(LessonSummary, {
    color: color
  })));
}
function LessonSummary({
  color
}) {
  const {
    TextField,
    SelectField,
    Button,
    Card,
    SectionLabel,
    Callout
  } = window.KunikDesignSystem_63ae72;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      alignItems: 'flex-start',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 320
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-card)',
      borderRadius: 'var(--radius-14)',
      padding: 20,
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 800,
      letterSpacing: '1.3px',
      color: 'var(--navy-800)',
      marginBottom: 16
    }
  }, "\u05E4\u05E8\u05D8\u05D9 \u05D4\u05E9\u05D9\u05E2\u05D5\u05E8"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(SelectField, {
    label: "\u05E9\u05DD \u05D4\u05EA\u05DC\u05DE\u05D9\u05D3/\u05D4",
    options: ['מרים כהן', 'יהודית ברק', 'רחל אבידן']
  }), /*#__PURE__*/React.createElement(TextField, {
    label: "\u05EA\u05D0\u05E8\u05D9\u05DA",
    type: "date",
    dir: "ltr",
    defaultValue: "2026-08-11"
  }), /*#__PURE__*/React.createElement(TextField, {
    label: "\u05E0\u05D5\u05E9\u05D0 \u05D4\u05E9\u05D9\u05E2\u05D5\u05E8",
    defaultValue: "WhatsApp \u2014 \u05D4\u05D5\u05D3\u05E2\u05D5\u05EA \u05D5\u05EA\u05DE\u05D5\u05E0\u05D5\u05EA",
    wrapStyle: {
      gridColumn: '1 / -1'
    }
  }), /*#__PURE__*/React.createElement(TextField, {
    label: "\u05DE\u05D4 \u05E2\u05D1\u05D3 \u05D8\u05D5\u05D1",
    multiline: true,
    rows: 2,
    defaultValue: "\u05D4\u05E7\u05DC\u05D8\u05EA \u05D4\u05D5\u05D3\u05E2\u05D4 \u05E7\u05D5\u05DC\u05D9\u05EA \u2014 \u05D4\u05E6\u05DC\u05D9\u05D7\u05D4 \u05DC\u05D1\u05D3 \u05D1\u05E4\u05E2\u05DD \u05D4\u05E9\u05DC\u05D9\u05E9\u05D9\u05EA",
    wrapStyle: {
      gridColumn: '1 / -1'
    }
  }), /*#__PURE__*/React.createElement(TextField, {
    label: "\u05DC\u05D7\u05D6\u05D5\u05E8 \u05E2\u05DC \u05D6\u05D4 \u05D1\u05E4\u05E2\u05DD \u05D4\u05D1\u05D0\u05D4",
    multiline: true,
    rows: 2,
    defaultValue: "\u05E9\u05DC\u05D9\u05D7\u05EA \u05EA\u05DE\u05D5\u05E0\u05D4 \u05DE\u05D4\u05D2\u05DC\u05E8\u05D9\u05D4",
    wrapStyle: {
      gridColumn: '1 / -1'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement(Button, {
    color: color,
    style: {
      flex: 1
    }
  }, "\u05E9\u05DE\u05D9\u05E8\u05EA \u05E1\u05D9\u05DB\u05D5\u05DD"), /*#__PURE__*/React.createElement(Button, {
    variant: "whatsapp",
    icon: "whatsapp"
  }, "\u05E9\u05DC\u05D9\u05D7\u05D4 \u05DC\u05EA\u05DC\u05DE\u05D9\u05D3\u05D4")))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 300px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Callout, {
    tone: "tip"
  }, "\u05DB\u05EA\u05D1\u05D9 \u05D0\u05EA \u05D4\u05E1\u05D9\u05DB\u05D5\u05DD \u05D1\u05D6\u05DE\u05DF \u05D4\u05E9\u05D9\u05E2\u05D5\u05E8, \u05DC\u05D0 \u05D0\u05D7\u05E8\u05D9\u05D5 \u2014 \u05D0\u05D7\u05E8\u05EA \u05D6\u05D4 \u05DC\u05D0 \u05E7\u05D5\u05E8\u05D4."), /*#__PURE__*/React.createElement(Callout, {
    tone: "info"
  }, "\u05D4\u05E1\u05D9\u05DB\u05D5\u05DD \u05E0\u05E9\u05DC\u05D7 \u05DC\u05EA\u05DC\u05DE\u05D9\u05D3\u05D4 \u05D1\u05D5\u05D5\u05D0\u05D8\u05E1\u05D0\u05E4 \u05DB\u05D3\u05D9 \u05E9\u05EA\u05D3\u05E2 \u05D1\u05DE\u05D4 \u05DC\u05D4\u05EA\u05D0\u05DE\u05DF \u05E2\u05D3 \u05D4\u05E4\u05E2\u05DD \u05D4\u05D1\u05D0\u05D4.")));
}
Object.assign(window, {
  TeachingToolkit
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/tech-eye-level/TeachingToolkit.jsx", error: String((e && e.message) || e) }); }

__ds_ns.ICON_PATHS = __ds_scope.ICON_PATHS;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Callout = __ds_scope.Callout;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.LevelPill = __ds_scope.LevelPill;

__ds_ns.SectionLabel = __ds_scope.SectionLabel;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.DateChip = __ds_scope.DateChip;

__ds_ns.DomainCard = __ds_scope.DomainCard;

__ds_ns.ListRow = __ds_scope.ListRow;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.SyncStatus = __ds_scope.SyncStatus;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.SelectField = __ds_scope.SelectField;

__ds_ns.TextField = __ds_scope.TextField;

__ds_ns.AppHeader = __ds_scope.AppHeader;

__ds_ns.HomeFab = __ds_scope.HomeFab;

__ds_ns.SidebarNav = __ds_scope.SidebarNav;

})();

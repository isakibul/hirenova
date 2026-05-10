const paths = {
    bell: (<>
      <path d="M18 16v-5a6 6 0 0 0-12 0v5"/>
      <path d="M4 16h16"/>
      <path d="M10 20h4"/>
    </>),
    briefcase: (<>
      <path d="M9 7V5h6v2"/>
      <path d="M5 7h14v12H5z"/>
      <path d="M5 12h14"/>
    </>),
    chart: (<>
      <path d="M5 19V5"/>
      <path d="M5 19h14"/>
      <path d="M9 15v-4"/>
      <path d="M13 15V8"/>
      <path d="M17 15v-2"/>
    </>),
    check: (<>
      <path d="M20 6 9 17l-5-5"/>
    </>),
    chevronDown: (<>
      <path d="m6 9 6 6 6-6"/>
    </>),
    file: (<>
      <path d="M7 3h7l4 4v14H7z"/>
      <path d="M14 3v5h5"/>
      <path d="M9 13h6"/>
      <path d="M9 17h4"/>
    </>),
    fullscreen: (<>
      <path d="M8 3H3v5"/>
      <path d="M16 3h5v5"/>
      <path d="M21 16v5h-5"/>
      <path d="M8 21H3v-5"/>
    </>),
    edit: (<>
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>
    </>),
    help: (<>
      <circle cx="12" cy="12" r="9"/>
      <path d="M9.5 9a2.5 2.5 0 0 1 4.5 1.5c0 2-2 2-2 3.5"/>
      <path d="M12 17h.01"/>
    </>),
    logOut: (<>
      <path d="M10 17 15 12 10 7"/>
      <path d="M15 12H3"/>
      <path d="M21 19V5"/>
    </>),
    message: (<>
      <path d="M4 5h16v11H8l-4 4z"/>
      <path d="M8 9h8"/>
      <path d="M8 13h5"/>
    </>),
    moon: (<>
      <path d="M20 15.5A8 8 0 0 1 8.5 4 7 7 0 1 0 20 15.5z"/>
    </>),
    plus: (<>
      <path d="M12 5v14"/>
      <path d="M5 12h14"/>
    </>),
    search: (<>
      <circle cx="11" cy="11" r="6"/>
      <path d="m16 16 4 4"/>
    </>),
    settings: (<>
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.56V21a2 2 0 1 1-4 0v-.08a1.7 1.7 0 0 0-1-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1H3a2 2 0 1 1 0-4h.08a1.7 1.7 0 0 0 1.56-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.56V3a2 2 0 1 1 4 0v.08a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.2.6.78 1 1.56 1H21a2 2 0 1 1 0 4h-.08a1.7 1.7 0 0 0-1.52 1Z"/>
    </>),
    spark: (<>
      <path d="M12 3v5"/>
      <path d="M12 16v5"/>
      <path d="M3 12h5"/>
      <path d="M16 12h5"/>
      <path d="m6 6 3 3"/>
      <path d="m15 15 3 3"/>
      <path d="m18 6-3 3"/>
      <path d="m9 15-3 3"/>
    </>),
    sun: (<>
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2"/>
      <path d="M12 20v2"/>
      <path d="m4.93 4.93 1.41 1.41"/>
      <path d="m17.66 17.66 1.41 1.41"/>
      <path d="M2 12h2"/>
      <path d="M20 12h2"/>
      <path d="m6.34 17.66-1.41 1.41"/>
      <path d="m19.07 4.93-1.41 1.41"/>
    </>),
    target: (<>
      <circle cx="12" cy="12" r="8"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="12" cy="12" r="1"/>
    </>),
    trash: (<>
      <path d="M4 7h16"/>
      <path d="M10 11v6"/>
      <path d="M14 11v6"/>
      <path d="M6 7l1 14h10l1-14"/>
      <path d="M9 7V4h6v3"/>
    </>),
    x: (<>
      <path d="M18 6 6 18"/>
      <path d="m6 6 12 12"/>
    </>),
    user: (<>
      <circle cx="12" cy="8" r="4"/>
      <path d="M5 21a7 7 0 0 1 14 0"/>
    </>),
};
export default function Icon({ name }) {
    return (<svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      {paths[name]}
    </svg>);
}

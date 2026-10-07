export default function NomiCornerWaves() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[30vh] min-h-48 max-h-72 overflow-hidden">
      <svg className="h-full w-full" viewBox="0 0 1440 300" preserveAspectRatio="none" fill="none">
        <path
          d="M0 142C116 103 210 105 330 148C450 192 544 197 665 143C738 111 798 111 860 137V300H0V142Z"
          fill="#9DBCAF"
          fillOpacity="0.46"
        />
        <path
          d="M562 194C684 159 760 116 874 139C1005 165 1087 205 1201 147C1300 97 1372 64 1440 82V300H562V194Z"
          fill="#E8C49F"
          fillOpacity="0.52"
        />
        <path
          d="M0 164C137 124 214 125 330 164C439 201 539 211 654 160"
          stroke="#E8B58F"
          strokeOpacity="0.52"
          strokeWidth="3"
        />
        <path
          d="M876 156C1002 181 1092 221 1206 164C1301 116 1377 84 1440 99"
          stroke="#E8B58F"
          strokeOpacity="0.42"
          strokeWidth="3"
        />
      </svg>
    </div>
  );
}
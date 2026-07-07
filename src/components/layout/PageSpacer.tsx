export default function PageSpacer() {
  return (
    <>
      <div style={{ height: '120px' }} className="page-spacer-desktop" />
      <style>{`
        @media (max-width: 768px) {
          .page-spacer-desktop { height: 100px !important; }
        }
      `}</style>
    </>
  )
}

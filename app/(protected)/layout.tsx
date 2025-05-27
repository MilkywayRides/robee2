export default function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className=''>
        <div className=''>
          <div className=''>
            {/* <Navbar /> */}
            <div className=''>{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}

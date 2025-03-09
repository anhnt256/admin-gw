const LoginLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen justify-center items-center text-gray-200 bg-no-repeat bg-cover bg-[url('/bg_galaxy.png')]">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">{children}</div>
      </div>
    </div>
  );
};
export default LoginLayout;

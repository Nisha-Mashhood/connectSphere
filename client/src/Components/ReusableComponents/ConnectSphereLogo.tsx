import Logo from "../../assets/logoMain.jpg";

export const ConnectSphereLogo = () => {
  return (
    <div className="h-9 w-28 flex items-center">
      <img
        src={Logo}
        alt="ConnectSphere"
        className="h-full w-full object-contain"
      />
    </div>
  );
};
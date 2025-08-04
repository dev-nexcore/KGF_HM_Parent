export const metadata = {
  title: "Parent Panel",
  icons: {
    icon: "/favicon.ico",
  },
};

import ParentLogin from "@/components/login/loginpage";

export default function Home() {
  return (
    <>
      <ParentLogin />
    </>
  );
}

// @ts-nocheck

"use client";

import { CustomChat, FacebookProvider } from "react-facebook";

const FacebookMsg = () => {
  return (
    <FacebookProvider appId="1787409175017819" chatSupport>
      <CustomChat pageId="479332872629184" minimized="true" />
    </FacebookProvider>
  );
};

export default FacebookMsg;

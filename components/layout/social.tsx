import React, { useEffect, useState } from 'react';
import { Box, IconButton } from '@mui/material';
import DiscordIcon from '../../public/socials/discord.svg';
import TwitterIcon from '../../public/socials/twitter.svg';
import MediumIcon from '../../public/socials/medium.svg';
import DocsIcon from '../../public/socials/docs.svg';
import Image from 'next/image';

const SocialIcons = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const shouldShowImage = windowWidth >= 800;

  return (
    <div>
      {/* {shouldShowImage && (
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: 0,
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            backgroundColor: 'rgba(255,255,255,0.5)',
            padding: '5px',
            borderRadius: '10px',
          }}
        >
          <Image src={TwitterIcon} alt="Twitter" width="32" height="32" />
          <Image src={DiscordIcon} alt="Discord" width="32" height="32" />
          <Image src={MediumIcon} alt="Medium" width="32" height="32" />
          <Image src={DocsIcon} alt="Docs" width="32" height="32" />
        </Box>
      )} */}
    </div>
  );
};

export default SocialIcons;

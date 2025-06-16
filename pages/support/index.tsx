import React, { useState, useEffect } from 'react';
import { onEntryChange } from '../../contentstack-sdk';
import RenderComponents from '../../components/render-components';
import { getPageRes,GetSupportBannerData } from '../../helper';
import Skeleton from 'react-loading-skeleton';
import SupportBanner from '../../components/support-banner';

import { Props, Context } from "../../typescript/pages";

const slidesData = [
  {
    backgroundImage: <img src="https://www.netgear.com/media/splash-fullasset-orbi970-desktop-save300_tcm148-167764.webp" alt="Orbi WiFi 7" className="w-full h-full object-cover" />,
    title: "Experience the most powerful & advanced Orbi",
    description: "Save up to $300 on Orbi 970 Series Black Edition. NETGEAR exclusive.",
    primaryCta: <a href="#">SHOP ORBI 970</a>,
    secondaryCta: <a className='text-white' href="#">LEARN MORE</a>,
    badge: <div className="bg-blue-600 text-white inline-block py-2 px-4 font-bold">SAVE $300</div>
  }
];

export default function Support(props: Props) {
  const { page, entryUrl } = props;
  const [getEntry, setEntry] = useState(page);
  // const [supportBannerData, setSupportBannerData] = useState({html: <></>});
  
  async function fetchData() {
    try {
      const entryRes = await getPageRes(entryUrl);
      if (!entryRes) throw new Error('Status code 404');
      setEntry(entryRes);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    onEntryChange(() => fetchData());
  }, []);

  // async function fetchSupportBannerData() {
  //     try {
  //       const datavalue = await GetSupportBannerData(
  //         "support_fragment",
  //         "bltd1601f4dc7280af8"
  //       );
  //       setSupportBannerData(datavalue);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   }
  
  //   useEffect(() => {
  //     fetchSupportBannerData();
  //   }, []);

  return getEntry ? (
    <>
      {/* <SupportBanner field={supportBannerData} /> */}
      <SupportBanner />
    </>
  ) : (
    <></>
    // <Skeleton count={3} height={300} />
  );
}

export async function getServerSideProps(context: Context) {
  try {
    const entryRes = await getPageRes(context.resolvedUrl);
    return {
      props: {
        entryUrl: context.resolvedUrl,
        page: entryRes || [],
      },
    };
  } catch (error) {
    return { notFound: true };
  }
}

import React, { useState, useEffect } from 'react';

type EntryData = {
  entry?: {
    html?: JSX.Element;
  };
};

export default function SupportBanner() {
  const [data, setData] = useState<EntryData>({ entry: { html: <></> } });

  async function fetchSupportBannerData() {
    try {
      const result = await fetch(
        `${window?.location?.origin}/api/get-support-data/?content_type_uid=support_fragment&entry_uid=bltd1601f4dc7280af8`
      );
      if (result.status === 200) {
        const jsonResult: EntryData = await result.json();
        setData(jsonResult);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchSupportBannerData();
  }, []);

  return (
    <>
      {data?.entry?.html && (
        <div dangerouslySetInnerHTML={{ __html: data?.entry?.html }} />
      )}
    </>
  );
}
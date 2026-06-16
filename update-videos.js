const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get all video modules
  const modules = await prisma.module.findMany({
    where: { contentType: 'video' }
  });
  
  console.log(`Found ${modules.length} video modules`);
  
  const videoMap = {
    'mini bar': 'https://www.youtube.com/embed/Z-eOuzqM0ns',
    'minibar': 'https://www.youtube.com/embed/Z-eOuzqM0ns',
    'safe box': 'https://www.youtube.com/embed/St815eDtI5c',
    'safe locker': 'https://www.youtube.com/embed/St815eDtI5c',
    'rfid': 'https://www.youtube.com/embed/ltARwWOPn6Q',
    'lock': 'https://www.youtube.com/embed/ltARwWOPn6Q',
    'kettle': 'https://www.youtube.com/embed/6OwThbSHUzE',
    'tcm': 'https://www.youtube.com/embed/4aBfypkw-oY',
    'tray': 'https://www.youtube.com/embed/4aBfypkw-oY',
    'mirror': 'https://www.youtube.com/embed/97RFXSbjqyk',
    'hair dryer': 'https://www.youtube.com/embed/97RFXSbjqyk',
    'signage': 'https://www.youtube.com/embed/qwdpnZ-5rRE',
    'dispenser': 'https://www.youtube.com/embed/4PYairCeKE4',
    'dustbin': 'https://www.youtube.com/embed/dbf6BYPRxYE',
    'housekeeping': 'https://www.youtube.com/embed/yVTyegoHfHY',
    'trolley': 'https://www.youtube.com/embed/yVTyegoHfHY',
    'luggage': 'https://www.youtube.com/embed/16vDMEt2BY8',
    'hanger': 'https://www.youtube.com/embed/WDh4zOJjarE',
    'rollaway': 'https://www.youtube.com/embed/G7a4zQITXTU',
    'bed': 'https://www.youtube.com/embed/G7a4zQITXTU',
    'mattress': 'https://www.youtube.com/embed/G7a4zQITXTU',
    'washroom': 'https://www.youtube.com/embed/DCbGeH-rF7U',
    'amenities': 'https://www.youtube.com/embed/DCbGeH-rF7U',
    'add on': 'https://www.youtube.com/embed/Ppk4OoV7hnU',
    'cross sell': 'https://www.youtube.com/embed/Ppk4OoV7hnU',
    'accessories': 'https://www.youtube.com/embed/Ppk4OoV7hnU',
    'godrej': 'https://www.youtube.com/embed/Z-eOuzqM0ns',
  };
  
  function getVideoUrl(title) {
    const lower = title.toLowerCase();
    for (const [keyword, url] of Object.entries(videoMap)) {
      if (lower.includes(keyword)) return url;
    }
    return null;
  }
  
  let updated = 0;
  for (const mod of modules) {
    const url = getVideoUrl(mod.title);
    if (url) {
      await prisma.module.update({
        where: { id: mod.id },
        data: { contentUrl: url }
      });
      console.log(`Updated: ${mod.title} → ${url}`);
      updated++;
    } else {
      console.log(`No match for: ${mod.title}`);
    }
  }
  
  console.log(`\nUpdated ${updated} of ${modules.length} modules`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

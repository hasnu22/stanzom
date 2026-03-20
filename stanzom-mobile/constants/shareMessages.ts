type ShareData = Record<string, any>;
export const shareMessages: Record<string, (data: ShareData) => string> = {
  player: (p) => `🏏 ${p.name} has ${p.followersCount} fans on Stanzom! ⭐${p.rating}\nFollow on the app 👉 stanzom.com/player/${p.id} #Stanzom`,
  team: (t) => `${t.name} has ${t.followersCount} fans on Stanzom · rated ⭐${t.rating}\n👉 stanzom.com/team/${t.id}`,
  rank: (u) => `🏆 I'm ranked #${u.rank} in ${u.scope} on Stanzom with ${u.accuracy}% accuracy!\n👉 stanzom.com #Stanzom`,
  pundit: () => `🔮 Check out The Pundit on Stanzom — see who predicted the match!\n👉 stanzom.com/pundit #ThePundit`,
  sentiment: (s) => `📊 ${s.percent}% of ${s.region} fans want ${s.team} to win on Stanzom!\n👉 stanzom.com/sentiment`,
  profile: (u) => `🎯 I have ${u.accuracy}% prediction accuracy on Stanzom!\n👉 stanzom.com #Stanzom`,
  influencer: (i) => `🌟 Follow ${i.name} on Stanzom! ${i.followers} fans · ⭐${i.rating}\n👉 stanzom.com/influencer/${i.id}`,
};
export const platformPoints: Record<string, number> = { wa: 10, tg: 10, x: 15, ig: 10, sc: 10, room: 5, copy: 3 };

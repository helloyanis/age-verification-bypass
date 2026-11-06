# How to use

- [Download the extension on Firefox](https://addons.mozilla.org/addon/age-verification-bypass?utm_source=github_readme), or the [releases page](https://github.com/helloyanis/agechecker.net-bypass/releases/latest). It will only work on Firefox and Firefox-based browsers, like Tor or Librewolf. It will NOT work on Chrome, even if you sideload it.

<a href="https://addons.mozilla.org/addon/age-verification-bypass?utm_source=github_readme"><img src="https://blog.mozilla.org/addons/files/2020/04/get-the-addon-fx-apr-2020.svg" alt="drawing" width="200"/></a>

- Make sure it is allowed to run on all websites (or at least on the website you are trying to use it on), and in private browsing mode if you use it, from the extension settings.
- Try to access a page gated by age verification, you will be directly let through. You can try on [ageChecker's demo page](https://agechecker.net/demo)

<a href="https://discord.gg/zUq5de7bTU"><img alt="Discord Invite Badge" width="200" src="https://img.shields.io/badge/Discord-Join%20to%20get%20help-blue?style=social&logo=discord"></a>

<a href="https://matrix.to/#/#age-verification-bypass:matrix.org"><img alt="Matrix invite" width="200" src="https://img.shields.io/badge/Matrix-Join%20to%20get%20help-black?style=social&logo=matrix&label=Matrix"></a>


# Supported services

**[Read the wiki](https://github.com/helloyanis/age-verification-bypass/wiki/Usage)** for more details!

| Website | Bypass level | Details |
|---|---|---|
| **[AgeChecker.net](https://agechecker.net/demo)** | ✳️ Partial (almost full) | [See wiki for this site](https://github.com/helloyanis/age-verification-bypass/wiki/agechecker.net) |
| **[AgeGO](https://agego.com)** | ❗ Partial (Not expected to work!) | [See wiki for this site](https://github.com/helloyanis/age-verification-bypass/wiki/agego) |
| **[AgeVerif.com](https://demo.ageverif.com/)** | ✳️ Partial (2/3 implementations bypassed) | [See wiki for this site](https://github.com/helloyanis/age-verification-bypass/wiki/ageverif.com) |
| **[AgeVerification.org](https://demo.ageverif.com/)** | ✅ Fully bypassed | [See wiki for this site](https://github.com/helloyanis/age-verification-bypass/wiki/ageverification) |
| **[AliExpress](https://aliexpress.com/)** | ✅ Fully bypassed | [See wiki for this site](https://github.com/helloyanis/age-verification-bypass/wiki/aliexpress) |
| **[AngeloGodsHack](https://angelogodshackxxx.com/)** | ✅ Fully bypassed | [See wiki for this site](https://github.com/helloyanis/age-verification-bypass/wiki/angelogodshack) |
| **[Bluesky](https://bsky.app)** | ✅ Fully bypassed | [See wiki for this site](https://github.com/helloyanis/age-verification-bypass/wiki/bsky) |
| **[Discord](https://discord.com)** | ✳️ Partial (almost full) | [See wiki for this site](https://github.com/helloyanis/age-verification-bypass/wiki/discord) |
| **[Erome.com](https://erome.com)** | ✅ Fully bypassed | [See wiki for this site](https://github.com/helloyanis/age-verification-bypass/wiki/erome) |
| **[Freshnewfaces.club](https://freshnewfaces.club)** | ✅ Fully bypassed | [See wiki for this site](https://github.com/helloyanis/age-verification-bypass/wiki/freshnewfaces) |
| **[Latinaspy.com](https://freshnewfaces.club)** | ✅ Fully bypassed | [See wiki for this site](https://github.com/helloyanis/age-verification-bypass/wiki/latinaspy) |
| **[Mewe](https://mewe.com)** | ✅ Fully bypassed | [See wiki for this site](https://github.com/helloyanis/age-verification-bypass/wiki/mewe) |
| **[Pimpbunny](https://pimpbunny.com)** | ✅ Fully bypassed | [See wiki for this site](https://github.com/helloyanis/age-verification-bypass/wiki/pimpbunny) |
| **[Reddit](https://reddit.com)** | ✳️ Partial (Conditions need to be met for the bypass to work) | [See wiki for this site](https://github.com/helloyanis/age-verification-bypass/wiki/reddit) |
| **[Redgifs](https://redgifs.com)** | ✅ Fully bypassed | [See wiki for this site](https://github.com/helloyanis/age-verification-bypass/wiki/redgifs) |
| **[Spankbang](https://spankbang.com)** | ✅ Fully bypassed | [See wiki for this site](https://github.com/helloyanis/age-verification-bypass/wiki/spankbang) |
| **[Veriff](https://veriff.com)** | ❗ Partial (Not expected to work!) | [See wiki for this site](https://github.com/helloyanis/age-verification-bypass/wiki/veriff) |
| **[X / Twitter](https://x.com)** | ✳️ Partial (Conditions need to be met for the bypass to work) | [See wiki for this site](https://github.com/helloyanis/age-verification-bypass/wiki/x) |
|  |  |  |

> [!NOTE]
> Have enough of ID age verification? Check out [this European Citizen's Initiative](https://furries.club/@helloyanis/117212986487046806) asking to stop killing the internet!

# Why do you do this?

It's a proof of concept to show that age verification online is not a good idea. Whenever you send your ID online, it has the potential of getting leaked, and in the worst case scenarios, someone can act as yourself, or blackmail you into revealing where you have been online (with irrefutable proof since they have your ID). No matter what the privacy policy says, or how secure the site is, hackers can always find a way to get the data. See [the amount of breached websites](https://haveibeenpwned.com/PwnedWebsites).

By using this extension, you are saving yourself from being in one of these breaches.

Also, it is technically almost never doable. This add-on is super lightweight and can still bypass the verification process. It can be unsafe, but it's not the role of the laws or dedicated platforms to know if someone's above legal age or not. People who want to bypass it for privacy reasons (or because they are children), will either go on less secure and less moderated websites and get exposed to potentially illegal content, or find a way to get around the verification wall, by using a tool like this one or a friend / parent's ID.


# How it works?

Depending on the sites, mainly 2 methods are used

## Rewrite server response

This extension will, on any website (hence why the "All URLs" permission is needed) look for calls that will create the age verification popup, and instead of letting the request through, will rewrite its own popup code which will automatically send the callback to the website that the verification has been successful. For example, Bluesky uses this.

## Hide and remove elements

The extension can inject a script into the page that will remove the elements like popups and image blurs that are added if a page is set to NSFW. For example, AliExpress and Reddit use this

**No data is ever being collected**. I (and age verification platforms) can't check if you have been on a certain website


## Want to check out some more of my stuff?

<a rel="me" href="https://furries.club/@helloyanis">Follow me on Mastodon</a>

<meta name="fediverse:creator" content="@helloyanis@furries.club">

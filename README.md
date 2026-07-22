# How to use

- [Download the extension on Firefox](https://addons.mozilla.org/addon/age-verification-bypass?utm_source=github_readme), or the [releases page](https://github.com/helloyanis/agechecker.net-bypass/releases/latest). It will only work on Firefox and Firefox-based browsers, like Tor or Librewolf. It will NOT work on Chrome, even if you sideload it.

<a href="https://addons.mozilla.org/addon/age-verification-bypass?utm_source=github_readme"><img src="https://blog.mozilla.org/addons/files/2020/04/get-the-addon-fx-apr-2020.svg" alt="drawing" width="200"/></a>

- Make sure it is allowed to run on all websites (or at least on the website you are trying to use it on), and in private browsing mode if you use it, from the extension settings.
- Try to access a page gated by age verification, you will be directly let through. You can try on [ageChecker's demo page](https://agechecker.net/demo)

# Supported services

- **[AgeChecker.net](https://agechecker.net/demo)** Fully bypassed, unless the site's server does a double check with the AgeChecker server
- **[AgeGO](https://agego.com)** Basic integration bypassed, advanced integration partially bypassed, server to server mode (when you don't get a popup but are redirected to an AgeGO page) bypassed but the server usually does additional checks so it is unlikely to work.
- **[AgeVerif.com](https://demo.ageverif.com/)** Basic and advanced integrations bypassed, not for the oAuth2 flow
- **[AliExpress](https://aliexpress.com/)** for viewing items categorized as "For adults".
- **[Bluesky](https://bsky.app)** for viewing sensitive posts without logging in. The posts are visible, and the medias are revealed by clicking on "Show" in the Sensitive Media banner
- **[Reddit](https://reddit.com)** for viewing NSFW communities. Log out to see them! *(It's a clunky solution, I recommend you use [redlib](https://redlib.catsarch.com/) for a fully private Reddit front-end where you can view NSFW posts!)*
- **[Veriff](https://veriff.com)** (Supports only a few sites using it! Try, but don't expect it to work!)

<a href="https://discord.gg/zUq5de7bTU">
<img alt="Discord Invite Badge" width="200" src="https://img.shields.io/badge/Discord-Join%20to%20get%20help-blue?style=social&logo=discord&link=https%3A%2F%2Fdiscord.gg%2FRdUJe4wJnP">
</a>

# Why do you do this?

It's a proof of concept to show that age verification online is not a good idea. Whenever you send your ID online, it has the potential of getting leaked, and in the worst case scenarios, someone can act as yourself, or blackmail you into revealing where you have been online (with irrefutable proof since they have your ID). No matter what the privacy policy says, or how secure the site is, hackers can always find a way to get the data. See [the amount of breached websites](https://haveibeenpwned.com/PwnedWebsites).

By using this extension, you are saving yourself from being in one of these breaches.

Also, it is technically almost never doable. This add-on is super lightweight and can still bypass the verification process. It can be unsafe, but it's not the role of the laws or dedicated platforms to know if someone's above legal age or not. People who want to bypass it for privacy reasons (or because they are children), will either go on less secure and less moderated websites and get exposed to potentially illegal content, or find a way to get around the verification wall, by using a tool like this one or a friend / parent's ID.


# How it works?

Depending on the sites, mainly 2 methods are used

## Rewrite server response

This extension will, on any website (hence why the "All URLs" permission is needed) look for calls that will create the age verification popup, and instead of letting the request through, will rewrite its own popup code which will automatically send the callback to the website that the verification has been succesful. For example, Bluesky uses this.

## Hide and remove elements

The extension can inject a script into the page that will remove the elements like popups and image blurs that are added if a page is set to NSFW. For example, AliExpress and Reddit use this

**No data is ever being collected**. I (and age verification platforms) can't check if you have been on a certain website
# How to use

- [Download the extension on Firefox](https://addons.mozilla.org/addon/age-verification-bypass?utm_source=github_readme), or the [releases page](https://github.com/helloyanis/agechecker.net-bypass/releases/latest). It will only work on Firefox and Firefox-based browsers, like Tor or Librewolf. It will NOT work on Chrome, even if you sideload it.

<a href="https://addons.mozilla.org/addon/age-verification-bypass?utm_source=github_readme"><img src="https://blog.mozilla.org/addons/files/2020/04/get-the-addon-fx-apr-2020.svg" alt="drawing" width="200"/></a>

- Make sure it is allowed to run on all websites (or at least on the website you are trying to use it on), and in private browsing mode if you use it, from the extension settings.
- Try to access a page gated by agechecker.net. The popup will not appear and you will be directly let through. You can try on [ageChecker's demo page](https://agechecker.net/demo)

# Supported services

- **[AgeChecker.net](https://agechecker.net/demo)**
- **[AgeVerif.com](https://demo.ageverif.com/)** (**NOT** for the oAuth2 flow)
- **[AliExpress](https://aliexpress.com/)** for viewing items categorized as "For adults"
- **[Reddit](https://reddit.com)** for viewing NSFW communities. *(It's a clunky solution, I recommend you use [redlib](https://redlib.catsarch.com/) for a fully private Reddit front-end where you can view NSFW posts!)*

<a href="https://discord.gg/zUq5de7bTU">
<img alt="Discord Invite Badge" width="200" src="https://img.shields.io/badge/Discord-Join%20to%20get%20help-blue?style=social&logo=discord&link=https%3A%2F%2Fdiscord.gg%2FRdUJe4wJnP">
</a>

# Why do you do this?

It's a proof of concept to show that age verification online is not a good idea. Whenever you send your ID online, it has the potential of getting leaked, and in the worst case scenarios, someone can act as yourself, or blackmail you into revealing where you have been online (with irrefutable proof since they have your ID). No matter what the privacy policy says, or how secure the site is, hackers can always find a way to get the data. See [the amount of breached websites](https://haveibeenpwned.com/PwnedWebsites).

By using this extension, you are saving yourself from being in one of these breaches.

Also, it is technically almost never doable. This add-on is less than 10kb and can still bypass the verification process. It can be unsafe, but it's not the role of the laws or dedicated platforms to know if someone's above legal age or not. People who want to bypass it for privacy reasons (or because they are children), will either go on less secure and less moderated websites and get exposed to potentially illegal content, or find a way to get around the verification wall, by using a tool like this one or a friend / parent's ID.

# How it works?

## For AgeChecker and AgeVerif

This extension will, on any website (hence why the "All URLs" permission is needed) look for calls that will create the age verification popup, and instead of letting the request through, will rewrite its own popup code which will automatically send the callback to the website that the verification has been succesful.

## For Aliexpress and Reddit

The extension will inject a script into the page that will remove the elements like popups and image blurs that are added if a page is set to NSFW

**No data is ever being collected**. I (and age verification platforms) can't check if you have been on a certain website

<a href="https://www.star-history.com/?repos=helloyanis%2Fage-verification-bypass&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=helloyanis/age-verification-bypass&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=helloyanis/age-verification-bypass&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=helloyanis/age-verification-bypass&type=date&legend=top-left" />
 </picture>
</a>
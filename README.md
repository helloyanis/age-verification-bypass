# How to use

- ~~[Download the extension on Firefox](https://addons.mozilla.org/addon/agechecker-net-bypass?utm_source=github_readme)~~ **Not yet available. Please wait for the mozilla add-ons team to review it, or sideload it from the [releases page](https://github.com/helloyanis/agechecker.net-bypass/releases/tag/v1.0.0)**. It will only work on Firefox and firefox based browsers, like Tor or Librewolf. It will NOT work on Chrome, even if you sideload it.
- Make sure it is allowed to run on all websites (or at least on the website you are trying to use it on), and in private browsing mode if you use it, from the extension settings.
- Try to access a page gated by agechecker.net. The popup will not appear and you will be directly let through. You can try on [ageChecker's demo page](https://agechecker.net/demo)

# Supported services

- [AgeChecker.net](https://agechecker.net/demo)
- [AgeVerif.com](https://demo.ageverif.com/) (**NOT** for the oAuth2 flow)

# Why do you do this?

It's a proof of conept to show that age verification online is not a good idea. Whenever you send your ID online, it has the potential of getting leaked, and in the worst case scenarios, someone can act as yourself, or blackmail you into revealing where you have been online (with irrefutable proof since they have your ID). No matter what the privacy policy says, or how secure the site is, hackers can always find a way to get the data. See [the amount of breached websites](https://haveibeenpwned.com/PwnedWebsites).

By using this extension, you are saving yourself from being in one of these breaches.

Also, it is technically almost never doable. This add-on is less than 10kb and can still bypass the verification process. It can be unsafe, but it's not the role of the laws or dedicated platforms to know if someone's above legal age or not. People who want to bypass it for privacy reasons (or because they are children), will either go on less secure and less moderated websites and get exposed to potentially illegal content, or find a way to get around the verification wall, by using a tool like this one or a friend / parent's ID.

# How it works?

This extension will, on any website (hence why the "All URLs" permission is needed) look for calls that will create the ageverif.net popup, and instead of letting the request through, will rewrite its own popup code which will automatically send the callback to the website that the verification has been succesful.

**No data is ever being collected**. I (and age verification platforms) can't check if you have been on a certain website
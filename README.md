# The Christian Story

## Hosted copy

Feel free to build the game for yourself, but the online hosted copy is
available on GitHub Pages at https://zabackary.github.io/the-christian-story/.

## Why?

This project sums up the four big steps of the Christian story which all
Christians and ultimately the entire world is a part of: the creation of Earth
and our creation in God's image; the fall and entrance of sin into the world;
our redemption through Jesus Christ; and the coming restoration and new heaven
and earth. It aims to convey these concepts in an easy-to-understand and
approachable format for Christians and non-Christians alike.

The other reason for this project is for my
[Intro to Christianity](https://caj.ac.jp/info/index.php/Course_Descriptions#Bible_9:_Introduction_to_Christianity)
class at [Christian Academy in Japan](https://caj.ac.jp/), a (or the) Christian
international school in Higashikurume, Tokyo, Japan. Maybe I'll get a better
grade if you star this repo 😂. _(don't worry, the game is probably not good
enough to warrent any praise.)_

## What?

The four steps of the Christian Story show God’s overall story for the world, starting with Creation. God shows his character through his creation and sustenance of all things living and nonliving. I chose two images to represent two key concepts of creation: an arrow pointing from nothing to a picture of space, representing creation ex nihilo, and a heart, representing the reason behind creation – to analyze using Aristotle’s “Four Causes”, creation was from nothing (material), created by God (efficient), for love (formal) and to love (final). The other representation of creation I chose is a little game of planting trees, representing humanity’s purpose at the beginning: to be caretakers of God’s creation, in His image, sustained by Him.

For the fall, I used a roll-playing-type interaction to show the temptation of humanity into sin. After eating the fruit, I used a warping animation to literally show the distortion of God’s creation, representing the world as still wholly and completely God’s creation, but with some things out of place, some things twisted. It still left every pixel intact and perfect, but showed sin by making it twisted into something unrecognizably evil. The player continues to the right, encountering God’s salvation plan through an image of the cross.

Redemption is represented in my project through an outline of redemption in the OT where a senior extended family member would rescue someone from something like poverty or captivity: that patriarch paid something to free the family member and bring them back into the family. After that, I used a game to show that no matter how hard we try, we are always going to be sinful people, literally crushed by sin, and with that note, I showed the cross being erected atop the pile of rocks and with Jesus’ resurrection, us being brought out from death and into God’s family.

The final piece of the puzzle is the restoration of creation. The book of Revelation within the Bible presents a wide variety of imagery for this step of story, but based on what we’ve learned, I chose to show God’s presence filling the earth through the church by animating people coming together and having tongues of fire above (or on!) their head. The new earth and new heaven is revealed through them, and with that, the river that is mentioned in the beginning of Revelation 22 is shown to be watering the Bible’s third tree – not the tree that tempted us nor the cross, but the tree whose “leaves [...] are for the healing of the nations.”

## Screenshots

### The level picker

![christian-story-home.png](https://github.com/zabackary/the-christian-story/assets/137591653/26db5074-8421-4726-b6cb-8d75b1474318)

### The first concept walkthrough

![christian-story-walkthrough.png](https://github.com/zabackary/the-christian-story/assets/137591653/0bb53886-4674-404f-811e-d1316f9c3b8c)

### One of the minigames

![christian-story-minigame.png](https://github.com/zabackary/the-christian-story/assets/137591653/fd0e1ff0-0698-449b-9f07-35f9d5582618)

## How can you help?

If you're inclined to work with TypeScript and HTML5 Canvas (2d context) and you
think you've found a bug, feel free to send a pull request. Note that your
changes' licensing is on shaky legal ground since I'm not a lawyer, but they
should be licensed under the MIT license included with your copy of the
codebase.

This project is built with [Vite](https://vitejs.dev/). To build and type-check,
clone the repo with
`git clone https://github.com/zabackary/the-christian-story.git` then run
install the deps and run `pnpm build`. To start the development server, run
`pnpm dev`. I make use of [PNPM](https://pnpm.io/) for the package manager, so
install that if you don't have that already.

### Internals explanation

There are two main parts to this project:

- The **framework**: a reusable framework for developing games. The idea of the framework is this: any function that takes in a `CanvasRenderingContext2D` should be able to render content. Thus, "components" are made using the built-in scrolling container and normal container which will automatically transpose and translate its children.
- The **game**

# Gridsponsive

Very opinionated responsive grids boilerplate.

## Why

I have used several grid systems in the past, but always ended adapting lots of code to follow client specs, until I finally decided to create my own system with these requirements in mind:

* Semantic: no need to use .col4-ish in HTML
* Flexible: allow for multiple grids for multiple breakpoints. For instance, mobile can use 4 columns with a column/gutter ratio of 4:1, while desktop might use 12 columns with 3:1. Or golden ratio. Whatever. 
* Fluid grids, obviously, either at 100% width or allowing for side margins.
* Mobile first
* Hell, everyone has their own boilerplate, right? 

## Dependencies

Gridsponsive requires:

* [Compass](http://compass-style.org/): The core of the Grids' setup and calculations uses mixins and functions, thus some sort of preprocessing was needed. SCSS syntax was preferred over SASS, LESS, etc.
* [GruntJS](http://gruntjs.com/): Gridsponsive itself would not strictly require it, but since I am using the boilerplate to include basic JS (jshint, concatenate, uglify), and in most projects I am using [Grunticon](https://github.com/filamentgroup/grunticon) to generate icons, Grunt was a no-brainer. Also, it has a nice livereload task.

## Installation
### Compass
If you haven't yet, you need to type `sudo gem install compass` in your terminal to install [Compass](http://compass-style.org/).

### Grunt and other packages
If you haven't yet, you will need to install [GruntJS](http://gruntjs.com/) (globally) typing `npm install -g grunt-cli`  (yes, it requires npm, so you will also need `brew install node`).
To install the other packages (locally) `npm install --save-dev`
This will add a node_modules folder in your project with subfolders including the packages listed in package.json. 

To avoid distributing these packages in your project just add them into your .gitignore file, as in `node_modules/*` (you might also want to avoid distributing your grunt file and sources folder)

### Build and Live Reload

We are using two-step process to build the public files: 

* Type `compass watch` in a terminal tab to take care of the SCSS files and convert to CSS (config.rb sets some customisable vars, such as `output_style`). 
* Type `grunt` in another terminal tab. This will take care of the Javascript files and build the public js. You can also use the live-reload feature by typing `grunt live`, which will trigger any html, js or scss change. Compass is not watched from Grunt since ethe task is quite slow, we might give it another try anytime soon and/or move to [GulpJS](http://gulpjs.com/).



## Basic Documentation
### Breakpoints
For each mediaquery you have to define a breakpoint variable, either using normal px value or converting to EM unit with `MQem` helper:

```
$bp-mobile  : MQem(320);    //: 20em
$bp-tablet  : MQem(744);    //: 46.5em
$bp-desk    : MQem(1024);   //: 64em
$bp-extra   : MQem(1348,40);//: 86.75em
```
Once defined, we can target specific breapoints using helpers (`bpmin`, `bpmax`, `bpminmax`) that convert to mediaqueries, as in:

```
p {
    font-size: 14px; // mobile first, px just an example
    @include bpmin($bp-tablet) {
        font-size: 18px;
    }
    @include bpminmax($bp-desk, $bp-extra) {
        font-size: 16px;
    }
}
```
We can also change default values for these two variables:

```
$USEGOLDENDEFAULT : 0;
$CGDEFAULT : 2;
```
First one tells next Grid functions to use Golden ratio as a multiplier for column/gutter ratio. By default it is not used. The later tells Gridsponsive the default column/gutter ratio is 2.

### The grid
Did I hear semantic grid system? It's pretty easy, instead of adding .col12 or .span4 classes to your markup, we can use semantic markup and define layout in CSS using two functions: 

`gridsetup(c, r, g)` can have arguments: c number of columns used in layout, r ratio between column/gutter, and g if this ratio is factored by golden number. For instance `include gridsetup(4,4);` creates a layout ready for 4 coluns where columns measure 4 times gutter width, while `include gridsetup(4,2,1);` creates a layout ready for 4 coluns where columns measure 2*1.61803398875 times gutter width.

Once we have setup layout for this mediaquery, we can assign column sizes to inside selectors using `gridwrap`/`gridcol`. They work similarly, but `gridwrap` collapses external margins so we can nest grids inside other grids. Both functions have same parameters (n, colsgap, offset, float): n number of used columns for this selector, colsgap number of gap columns left aside, offset px/em besides gap,  float direction. Default values are setup columns, 0, 0, left. Example:

```
div {
    include gridsetup(4,4);
    @include gridwrap(4); /* takes all space including outer margins */

    span { 
        @include gridcol(2); /* 2 out of 4 columns */
    } 
    img { 
        @include gridcol(2, 1); /* 2 columns, leaving 1 column gap on the left */
    } 
}
```

This way my markup will be semantic since I'm not adding size-meaning to elements that will change measures with media queries. 

We can also defined inner paddings using `relGutW` function, that takes number of used columns in that selector, then calculates internally the effective 1 gutter size as relative measure unit. Using same example above:

```
p {
    @include gridcol(2); 
    padding: 0 @include relGutW(2); /* sides padding = 1 gutter width */
}
```

### Goodies

Gridsponsive comes with some variables, mixins and functions to make your life easier, most used ones are:


* `prefixer` helps you… prefix stuff with -webkit-, -moz-, -ms- and -o-
* `rem` lets you use px fonts that are then converted to a px fallback + rem unit.
* There's a `DEBUGMODE` variable (boolean 0/1, default 0) that applies specific background colors and opacity to test boxes width/height, visualize grids beneath layout, etc. Example

```
$DEBUGMODE : 1; 
.expandedbox {
  @include debug(red, white);
}
```

* You can optionally test your layout using the grid.js that will paint columns for each media query. This is exportable from Gruntfile.js (you will need to add grid.js to the build process). This has yet to be documented, and eventually sync'ed from generated Grids.

### Basic layout blocks

Gridsponsive does not setup any visual design, but it comes with 3 basic layout blocks that allow creation of full-width sections with inside paddings restricted to a max-width. These blocks are `.expandedbox`, `.wrapbox`, `.contentbox`, defined in _base.scss:

```
/* expendedbox gets 100% full width */
.expandedbox {
    position: relative;
    clear: both;
    background-color: white;
    width: 100%;
    max-width: 100%;
    &:after { @include clearme(); }
}

/* wrapbox adjust margins depending on mediaqueries */
.wrapbox {
    position: relative;
    clear: both;
    margin: 0 auto;
    padding: 0;
    max-width: 93.6%; /* 93.6% is nice for 320px full -> 300px content */
    @include bpmin($bp-tablet) { /* 46.5em*DEFAULT!16px=744px */ 
        max-width: 90%; /* max-width: em(744, 10); would fix content, % is fluid */
    }
    @include bpmin($bp-extra) { /* 84.25em*DEFAULT!16px=1348px */ 
        max-width: em(1348,10);
    }
    &:after { @include clearme(); }
}

/* content boxes get 100% of container (typically a wrapbox) */
.contentbox {
    position: relative;
    clear: both;
    width: 100%;
    &:after {@include clearme();}
}
```


## TO-DO

* Dedicated site with more detailed documentation and demos :-)
* Grunt task for first-time breakpoints and Grids creation
* Sync grids.js/grids.css helpers with values used at Grids creation

## Complaints?
Use the issue tracker, send pull requests, the usual polite manners. Thanx.

## License
[FreeBSD](http://github.com/zigotica/gridsponsive/blob/master/LICENSE.txt)

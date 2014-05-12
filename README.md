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
* [GruntJS](http://gruntjs.com/): Gridsponsive itself would not strictly require it, but since I am using the boilerplate to include basic JS (jshint, concatenate, uglify), and in most projects I am using [Grunticon](https://github.com/filamentgroup/grunticon) to generate icons, Grunt was a no-brainer. Also, it has a nice livereload task. This requirement might be dropped/split in a near future to move the boilerplate into a new repo.

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

* Type `compass watch` in a terminal tab to watch for changes in SCSS files and convert to CSS (config.rb sets some customisable vars, such as `output_style`). You can keep this tab open and task running in order to trigger succesive changes.
* Type `grunt` in another terminal tab. This will take the Javascript files and build the public js. You can also use the live-reload feature by typing `grunt live`, which will trigger any html, js or scss change and force a rebuild. Compass is not watched from Grunt since the task is quite slow, we might give it another try anytime soon and/or move to [GulpJS](http://gulpjs.com/). You can keep this tab open and `grunt live` running in order to trigger succesive changes.

Now that public files are modified automatically, we will tell the browser to reload the page every time a build is made. 

* You will need to install Live Reload extension in your browser. 

## How to create Grids and Breakpoints
I created a Ruby script to automatically create breakpoints and Grid variables and functions by asking simple questions through the console. Just open a third terminal tab and run `ruby gridsetup.rb`, then answer some questions. Remember to have a terminal tab open with `compass watch` and another with `grunt live` running.

## Gridsponsive use with our styles
### Mediaqueries
When questions are finished the system creates variables and mixins that will later be used within our own styles. We can target specific breakpoints using `bpmin`, `bpmax` and `bpminmax` mixins. These contain a grid setup based on the questions answered before, which allows us to reset/change grid between breakpoints. 

For instance, if we had created 3 breakpoints, named tablet, desk and extra, we could do:

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

### The grid
Did I hear semantic grid system? It's pretty easy, instead of adding .col12 or .span4 classes to your markup, we can use semantic markup and define layout in CSS using `gridwrap`/`gridcol` mixins. They work similarly, but `gridwrap` collapses external margins so we can nest grids inside other grids. Both functions have same parameters (n, colsgap, offset, float): n number of used columns for this selector, colsgap number of gap columns left aside, offset px/em besides gap,  float direction. Default values are setup columns, 0, 0, left. Example:

```
div {
    @include gridwrap(4); /* takes all space including outer margins */

    span { 
        @include gridcol(2); /* 2 out of 4 columns */
    } 
    img { 
        @include gridcol(2, 1); /* 2 columns, leaving 1 column gap on the left */
    } 
}
```

This way your markup will be semantic since you're not adding size-meaning to elements that will change measures with media queries. 

Since different grid columns and proportions are allowed, we need to setup which one to use within each breakpoint/mediaquery. This is managed *automatically* by `bpmin`, `bpmax` and `bpminmax` mixins. For instance:

```
p {
	@include gridreset; @include gridcol(2); // this could be 4 columns 40px:20px column/gutter ratio
    @include bpmin($bp-tablet) {
        @include gridcol(2); // this could be 4 columns 60px:20px column/gutter ratio
    }
    @include bpminmax($bp-desk, $bp-extra) {
        @include gridcol(4); // this could be 24 columns 1:1 column/gutter ratio
    }
}
```

As you can see, when we have more than one grid and you call `gridwrap`/`gridcol` mixins outside of `bpmin`, `bpmax` and `bpminmax` mediaqueries, we need to include a `@include gridreset;` (in this case it's not automatic since we are outside those 'magic' mixins), for example: 

```
.selector {
    @include gridreset; @include gridcol(4); // this could be 4 columns 40px:20px column/gutter ratio
    @include bpmin($bp-tablet) { 
        @include gridcol(7); // this could be 24 columns 1:1 column/gutter ratio
    }
}
```

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
    &:after { @include clearme(); }
}
/*/ CUSTOM MAXW FOR WRAPBOX */
@import "gridcustommaxw";

/* content boxes get 100% of container (typically a wrapbox) */
.contentbox {
    position: relative;
    clear: both;
    width: 100%;
    &:after {@include clearme();}
}
```
As you can see, we import `gridcustommaxw` file, which is created answering the questions to the ruby script and automatically calculates the `max-width` values for each grid/breakpoint. Easy-peasy. An example HTML markup would be

```
	<div class="expandedbox">
	    <div class="wrapbox">
	        <div class="contentbox">
	        	<p>Lorem ipsum dolor sit amet.</p>        
	        </div>
	    </div>
	</div>
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

* We can also define inner paddings using `gutterW` function, that takes number of used columns in that selector, then calculates internally the effective 1 gutter size as relative measure unit. Using same example above:

```
p {
    @include gridcol(2); 
    padding: 0 @include gutterW(2); /* sides padding = 1 gutter width */
}
```

* You can optionally test your layout using the grid.js that will paint columns for each media query. This is exportable from Gruntfile.js (you will need to add grid.js to the build process). It needs a server to inject the files, using `grunt live` task is ok. This helper is sync'ed with values coming from answers to the ruby script. **Important note: In order to view the grid columns for development, which are injected using JS, you need to use a server, for instance localhost created by livereload grunt task.**


## TO-DO

- [ ] (under development) Dedicated site with more detailed documentation and demos :-)
- [x] Ruby console script to automatically create breakpoints and Grid variables and functions by asking simple questions to developer and writting to SCSS file. 
- [x] Sync grids.js/grids.css helpers with values used at Grids creation

## Complaints?
Use the issue tracker, send pull requests, the usual polite manners. Thanx.

## License
[FreeBSD](http://github.com/zigotica/gridsponsive/blob/master/LICENSE.txt)

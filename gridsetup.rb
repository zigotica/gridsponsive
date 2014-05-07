#!/usr/bin/ruby

# WRITE FUNCTIONS --------------------------------
def writeBreakPoints (file)
    if file
        file.syswrite("\n\n/*/ ------------------------------------------------------- BREAKPOINTS */")
        MEASURES.each do |i|
            file.syswrite(bp(i["NAME"], i["FROM"]))
        end
    else
        puts "Unable to open file!"
    end
end

def writeGridsetup (file)
    if file
        file.syswrite("\n\n/*/ ------------------------------------------------------- GRIDSETUP */")
        file.syswrite( gridsetup() )
        
    else
        puts "Unable to open file!"
    end
end

def writeGridMaxw (file)
    if file
        file.syswrite("\n\n/*/ ------------------------------------------------------- CONTENT MAXW */")
        file.syswrite( gridmaxwidths() )
    else
        puts "Unable to open file!"
    end
end

def writeGridHelper (file)
    $k = 0
    if file
        file.syswrite("\n\n/*/ ------------------------------------------------------- GRID VISUAL HELPER */")
        file.syswrite( gridhelper() )
        
    else
        puts "Unable to open file!"
    end
end

# export list of breakpoints to sass variables
def bp (name, value)
    if name != "" 
        return "\n$bp-#{name} : #{value};"
    else
        return ""
    end
end

# grid setup to be used automagically inside mediaqueries bpmin,bpmax,bpminmax @mixin
def gridsetup ()
    $buffer = ""
    $buffermin = ""
    $buffermax = ""
    items = MEASURES
    $LEN = items.length
    $g = $LEN
    $parsed = 0

    $buffermin += "\n@mixin bpMinSetup($bp) {"
    $buffermax += "\n@mixin bpMaxSetup($bp) {"
    until $g == 0
        $TYPE   = items[$g-1]['TYPE']
        $FROM   = items[$g-1]['FROM']
        $NAME   = items[$g-1]['NAME']
        $FLUID  = items[$g-1]['FLUID']
        $COLS   = items[$g-1]['COLS']

        if $FLUID == "f" || $FLUID == "F"
            $RATIO  = items[$g-1]['RATIOPREGOLDEN'] * items[$g-1]['GOLDEN']
            $SETUP  = "gridSetup(#$COLS,#$RATIO);"
        else
            $COLW   = items[$g-1]['COLW']
            $GUTW   = items[$g-1]['GUTW']
            $SETUP = "gridFixedSetup(#$COLS,#$COLW,#$GUTW);"
        end

        if $LEN == 1 # unique grid with no breakpoints
            $buffermin += "\n    @include gridreset;\n}"
            $buffermax += "\n    @include gridreset;\n}"
        elsif $FROM != 0 && $parsed == 0
            $buffermin += "\n    @if $bp >= $bp-#$NAME { @include #$SETUP } "
            $buffermax += "\n    @if $bp >  $bp-#$NAME { @include #$SETUP } "
        elsif $FROM != 0 
            $buffermin += "\n    @else if $bp >= $bp-#$NAME { @include #$SETUP } "
            $buffermax += "\n    @else if $bp >  $bp-#$NAME { @include #$SETUP } "
        else
            $buffermin += "\n    @else { @include gridreset; }\n}"
            $buffermax += "\n    @else { @include gridreset; }\n}"
        end

        $parsed += 1
        $g -= 1
    end
    $buffer += $buffermin 
    $buffer += $buffermax 

$COLS   = items[0]['COLS']
$FLUID  = items[0]['FLUID']
if $FLUID == "f" || $FLUID == "F"
    $RATIO  = items[0]['RATIOPREGOLDEN'] * items[0]['GOLDEN']
    $SETUP  = "gridSetup(#$COLS,#$RATIO);"
else
    $COLW   = items[0]['COLW']
    $GUTW   = items[0]['GUTW']
    $SETUP = "gridFixedSetup(#$COLS,#$COLW,#$GUTW);"
end
$buffer += "
@mixin gridreset() {
    @include #$SETUP
}
/* default grid setup at root level */
@include gridreset;
"

return $buffer
end

# exports content max-width defined for each breakpoint so we can center content in page
def gridmaxwidths ()
    # write a media query for each breakpoint
    $g = 0
    items = MEASURES
    $LEN = items.length
    $buffer = ""

    until $g == $LEN
        if $g == 0
            $NAME = 0
            $NAMETXT = "default"
        else
            $NAME = "$bp-" + items[$g]['NAME']
            $NAMETXT = $NAME
        end
        $FROM = items[$g]['FROM']
        $MAXW   = items[$g]['MAXW']
        $buffer += "
        /* #$NAMETXT breakpoint (#$FROM) */
        @media (min-width: #$NAME){
            .wrapbox {
                max-width: #$MAXW; 
            }
        }
        "

        $g += 1
    end

    return $buffer
end


# writes columns to help you (debug mode) align content while building a site
def gridhelper ()
    $helper = ""
    $g = 0
    items = MEASURES
    $LEN = items.length
    $parsed = 0

    until $g == $LEN
        $TYPE   = items[$g]['TYPE']
        if $g == 0
            $NAME = "default"
        else
            $NAME = "$bp-" + items[$g]['NAME']
        end
        $FROM   = items[$g]['FROM']
        $COLS   = items[$g]['COLS']
        $FLUID  = items[$g]['FLUID']
        $RATIOPREGOLDEN   = items[$g]['RATIOPREGOLDEN']
        $GOLDEN = items[$g]['GOLDEN']
        $RATIO  = $RATIOPREGOLDEN * $GOLDEN
        $COLW   = items[$g]['COLW']
        $GUTW   = items[$g]['GUTW']
        $MAXW   = items[$g]['MAXW']
        $COLBG  = items[$g]['COLBG']

        
        if $TYPE == "grid_bp"
            $helper += "\n/* %s GRID */" % [$NAME]
            $helper += "\n@media (min-width: #$FROM){"
            if $FLUID == "f" || $FLUID == "F"
                $HALW   = "cal(-#$MAXW/2)"
                $GUTW   = "cal(100%/(#$COLS+(#$COLS*#$RATIO)))"
                $MRGW   = "cal(50%/(#$COLS+(#$COLS*#$RATIO)))"
                $COLW   = "cal(100%*#$RATIO/(#$COLS+(#$COLS*#$RATIO)))" 

            else 
                $HALW   = "cal(-#$COLS/2*(#$COLW+#$GUTW))"
                $MAXW   = "cal(#$COLS*(#$COLW+#$GUTW))"
                $MRGW   = "cal(#$GUTW/2)"
            end
            $helper += "
            #grid {
                margin-left: #$HALW;
                max-width: #$MAXW;  
            }
            #grid div.vert {
                background: #$COLBG;
                width:  #$COLW;
                margin: 0 #$MRGW;
            }
            #grid div.vert.first-line {
                margin-left: #$MRGW;
            }
            #grid div.vert.cols#$COLS { /* this grid uses #$COLS cols */
                margin-right: 0;
            }
            "
            if $parsed > 0
                $target = $parsed - 1
                $PREVCOLS = getPreviousGridCols ( $target )

                $helper += "
                #grid div.vert.cols#$PREVCOLS { /* reset previous #$PREVCOLS cols grid */
                    margin-right: #$MRGW;
                }
                "
            end
            $helper += "\n}"

            $parsed += 1
        else
            if $FLUID == "f" || $FLUID == "F"
                $HALW   = "cal(-#$MAXW/2)"

            else
                $HALW   = "cal(-#$COLS/2*(#$COLW+#$GUTW))"
                $MAXW   = "cal(#$COLS*(#$COLW+#$GUTW))"
            end
            $helper += "
            /* extra breakpoint */
            @media (min-width: #$FROM){
                #grid {
                    margin-left: #$HALW;
                    max-width: #$MAXW; 
                }
                #grid div.vert {
                    background: #$COLBG;
                }
            }
            "
        end
        $g += 1
    end

return $helper
end


# UTILITY FUNCTIONS --------------------------------
def getPreviousGridCols ( target )
    $k = 0
    items = MEASURES
    $LEN = items.length
    $grids = 0
    puts "asked for target %s" % [target]

    until $k == $LEN
        $t = items[$k]['TYPE']
        if $t == "grid_bp"
            puts "grid_bp detected %s from loop iteration %s (parsed %s)" % [items[$k]['COLS'], $k, $grids]
            if $grids == target
                $matched = items[$k]['COLS']
                puts "matched %s" % [$matched]
            end
            $grids += 1
        end
        $k += 1
    end

    return $matched
end

def str (input)
    return input.chomp.downcase.gsub(/[[:space:]]/,'')
end

def num (input)
    return input.to_i
end


# QUESTIONNAIRE --------------------------------
def askGridQuestions( measure=0, bpname="", bpvalue=0 )
    puts "How many columns?"
    $numcols = num(gets)
    puts "Fluid(f) or static(s) grid?"
    $fluid = str(gets)
    if $fluid  == "F" || $fluid  == "f"
        $colw = ""
        $gutw = ""
        puts "Column/gutter ratio (ie. 3, meaning column is 3 times wider than gutter)"
        $ratiopregolden = num(gets)        
        puts "Column/gutter ratio affected by golden number (y/n; ie: if y, column would become 3*1.61803398875 = 4.85410196625 times wider than gutter)"
        $goldenfactor = num(gets)
        if $goldenfactor == "y" || $goldenfactor == "Y"
            $goldenfactor = $GOLDNUM
        else
            $goldenfactor = 1
        end
        puts "max-width for content: (ie: 93.6%, 110em)"
        $maxw = str(gets)
    else
        $fluid = "s"
        puts "Column width, using pixels (ie. 60px)"
        $colw = str(gets)
        puts "Gutter width, using pixels (ie. 20px)"
        $gutw = str(gets)
        $ratiopregolden = num($colw.to_i / $gutw.to_i)
        $goldenfactor = 1
        $maxw = "%spx" % ($numcols.to_i * ($colw.to_i + $gutw.to_i))
    end
    puts "background-color for visual helper columns: (ie: red, #330000)"
    $colbg = str(gets)

    # write grid data to array using a hash
    PUSH Hash[
        "TYPE"  => "grid_bp",
        "NAME"  => bpname,
        "FROM"  => bpvalue,
        "COLS"  => $numcols, 
        "FLUID" => $fluid, 
        "RATIOPREGOLDEN"=> $ratiopregolden, 
        "GOLDEN"=> $goldenfactor, 
        "COLW"  => $colw, 
        "GUTW"  => $gutw, 
        "MAXW"  => $maxw, 
        "COLBG" => $colbg
    ]

    # want a breakpoint?
    askBreakPoint()
end

def PUSH(hash)
    MEASURES.push hash
end

def askBreakPoint()
    puts "Need to add a breakpoint? (y/n)"
    $bp = gets.chomp
    
    if $bp == "y" || $bp == "Y"
        puts "Breakpoint name:"
        $BPNAME = str(gets)
        puts "Breakpoint measure (ie: 40.5em, 320px)"
        $BPVALUE = str(gets)
        
        # want a grid above this breakpoint?
        puts "Need a different grid (cols, proportions, …) for width beyond #$BPNAME breakpoint? (y/n)"
        $more = str(gets)
        if $more == "y" || $more == "Y"
            # build a new grid, passing name/value:
            askGridQuestions( MEASURES.length, $BPNAME, $BPVALUE )
        else
            $i_cols   = MEASURES[MEASURES.length-1]['COLS']
            $i_fluid  = MEASURES[MEASURES.length-1]['FLUID']
            $i_pregolden = MEASURES[MEASURES.length-1]['RATIOPREGOLDEN']
            $i_golden = MEASURES[MEASURES.length-1]['GOLDEN']
            $i_colw   = MEASURES[MEASURES.length-1]['COLW']
            $i_gutw   = MEASURES[MEASURES.length-1]['GUTW']
            $i_maxw   = MEASURES[MEASURES.length-1]['MAXW']
            $i_colbg  = MEASURES[MEASURES.length-1]['COLBG']
            if $i_fluid == "f" || $i_fluid == "F"
                puts "Enter a #$BPNAME-specific max-width for content (ie: 93.6%, 110em, [blank])?"
                $maxw = str(gets)
                if $maxw == "" 
                    $maxw = $i_maxw
                end
            else
                $maxw = $i_maxw
            end
            puts "Enter a #$BPNAME-specific background-color for visual helper columns (ie: red, #330000, [blank])?"
            $colbg = str(gets)
            if $colbg == "" 
                $colbg = $i_colbg
            end
            
            # write grid data to array using a hash
            PUSH Hash[
                "TYPE"  => "bp",
                "NAME"  => $BPNAME,
                "FROM"  => $BPVALUE,
                "COLS"  => $i_cols, 
                "FLUID" => $i_fluid, 
                "RATIOPREGOLDEN"=> $i_pregolden, 
                "GOLDEN"=> $i_golden, 
                "COLW"  => $i_colw, 
                "GUTW"  => $i_gutw, 
                "MAXW"  => $maxw, 
                "COLBG" => $colbg
            ]

            # want a new breakpoint?
            askBreakPoint()   
        end
    end
end


# UTILITY VARS --------------------------------
$GOLDNUM = 1.61803398875
MEASURES = Array.new
$gridSetupURL = "sources/compass/_gridcustom.scss"
$gridSetupFile = File.new($gridSetupURL, "w")
$gridMaxWURL = "sources/compass/_gridcustommaxw.scss"
$gridMaxWFile = File.new($gridMaxWURL, "w")
$gridVisualURL = "sources/compass/_gridhelpercustom.scss"
$gridVisualFile = File.new($gridVisualURL, "w")


# RUN --------------------------------
askGridQuestions()


# WRITE TO FILES --------------------------------
writeBreakPoints $gridSetupFile
writeGridsetup $gridSetupFile
writeGridMaxw $gridMaxWFile
writeGridHelper $gridVisualFile


# GOODBYE! --------------------------------
puts "\nTHANK YOU FOR USING GRIDSPONSIVE\nCustom files written to #{$gridSetupURL}, #{$gridMaxWURL} and #{$gridVisualURL} (should be processed into CSS)"
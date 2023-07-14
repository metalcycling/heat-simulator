//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
/*
Jan £ukasz Górski - mathmed.blox.pl, janlgorski@gmail.com
POLAND, under X11 license, feel free to modify and seed
//////////////////////////////////////////////////////////
simplest use:
// HTML
<script src="thisJavaScriptFile.js"></script>
<canvas id="myCanvas" width="500" height="500"></canvas>
<script>
var dataArray -> your 2d array with values
var canvas = document.getElementById("myCanvas");
var draw = new SciDraw();
draw.canvas = canvas;
draw.data = dataArray;
// configure before calling plot function !
draw.plot();
</script>
*/
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
function SciDraw() 
{
    this.minMaxValues = function(array) 
    {
        var minmax = {min:array[0][0], max:array[0][0]};
        for(var i=0;i<array.length;i++) 
        {
            for(var j=0;j<array[0].length;j++)
            {
                if(minmax.min > array[i][j]) minmax.min = array[i][j];
                if(minmax.max < array[i][j]) minmax.max = array[i][j];
            }
        }

        if (minmax.max == minmax.min) minmax.max += 0.00000001; // nonequal condition
        return minmax;
    }

    //////////////////////////////////////////////////////////
    // canvas clearing
    //////////////////////////////////////////////////////////	
    this.clearCanvas = function (canvas) 
    {
        var cWidth = canvas.width;
        var cHeight = canvas.height;
        var canvas_context = canvas.getContext("2d");

        canvas_context.clearRect(0, 0, cWidth, cHeight);
    }

    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    // color ramp generator
    //////////////////////////////////////////////////////////
    function returnColor(value) 
    {
        var color = 0;

        if (value>0 && value<256) color = value;
        if (value>=256 && value<512) color = 255;
        if (value>=512 && value<768) color = 767 - value;

        return color;
    }
    //////////////////////////////////////////////////////////
    this.tellColorArray = function() 
    {
        var colorArray = new Array();

        for(var value=0; value<1024; value++) 
        {
            var color = { b:returnColor(value), g: returnColor(value-256), r:returnColor(value-512) };
            colorArray[value] = color;
        }

        return colorArray;
    }

    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    // color fields painter
    //////////////////////////////////////////////////////////
    this.drawColorsF = function(canvas, array) 
    {
        var multiplicationCoeff = (this.colorHighest-this.colorLowest) / (this.minmax.max - this.minmax.min);

        var canvas_context = canvas.getContext("2d");
        var cWidth = canvas.width;
        var cHeight = canvas.height;

        var fieldsHoriz = Math.round(cWidth/array.length);
        var fieldsVert = Math.round(cHeight/array[0].length);
        var colorRampLimit = this.colorsRamp.length-1;

        for(var i=0;i<array.length;i++) 
        {
            for(var j=0;j<array[0].length;j++) 
            {
                var val = Math.floor(multiplicationCoeff*(array[i][j]-this.minmax.min)+this.colorLowest);
                // array index control
                val = Math.max(Math.min(val, colorRampLimit),this.colorLowest);
                //
                canvas_context.fillStyle = 'rgb('+this.colorsRamp[val].r+','+this.colorsRamp[val].g+','+this.colorsRamp[val].b+')';
                canvas_context.fillRect(fieldsHoriz*i, fieldsVert*j, fieldsHoriz, fieldsVert);
            }
        }
    }

    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    // canvas values writer
    //////////////////////////////////////////////////////////
    //////// modifies spacing basing on max value
    function determineSpacing(number) 
    {
        var spacing=0;

        do 
        {
            number/=10;
            spacing++;
        } 
        while (number>1);

        return spacing;
    }

    ////////////////////////////////////////////
    this.generalSpacingCalculations = function(correction) 
    {
        var rounding = Math.pow(10,determineSpacing(100/(this.minmax.max-this.minmax.min)))*0.01*Math.pow(10,correction);
        var spacingPixels = (determineSpacing(Math.max(Math.abs(this.minmax.max),Math.abs(this.minmax.min))+rounding))*this.fontSize;
        if(this.minmax.min<0) spacingPixels+=this.fontSize;

        return {rounding:rounding, spacingPixels:spacingPixels};
    }
    //////////////////////////////////////////////////////////
    //////// master function
    this.drawValuesF = function(canvas, array) 
    {
        var distances = this.generalSpacingCalculations(this.roundingCorrection);

        var canvas_context = canvas.getContext("2d");
        var cWidth = canvas.width;
        var cHeight = canvas.height;

        var spacingFinal =  Math.max(Math.ceil(distances.spacingPixels/(cWidth/array[0].length)),1); 
        var fieldsHoriz = cWidth/array.length;
        var fieldsVert = cHeight/array[0].length;

        canvas_context.fillStyle = this.fontColor;
        canvas_context.font = this.fontStyle + ' ' + this.fontSize + 'px ' + this.fontFace;

        for(var i=0;i<array.length;i+=spacingFinal) 
        {
            for(var j=0;j<array[0].length;j+=spacingFinal) 
            {
                canvas_context.fillText(Math.round(array[i][j]*distances.rounding)/distances.rounding, fieldsHoriz*i+3, fieldsVert*j+this.fontSize+3);
            }
        }
    }
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    // canvas vectors painter
    //////////////////////////////////////////////////////////
    this.drawVectorsF = function(canvas, arrayX, arrayY) 
    {
        var canvas_context = canvas.getContext("2d");
        var cWidth = canvas.width;
        var cHeight = canvas.height;

        var fieldsHoriz = cWidth/arrayX.length;
        var fieldsVert = cHeight/arrayX[0].length;

        var minmaxX = this.minMaxValues(arrayX);
        var minmaxY = this.minMaxValues(arrayY);
        var totalMaxValue = Math.max(Math.max(Math.abs(minmaxX.max),Math.abs(minmaxX.min)), Math.max(Math.abs(minmaxY.max),Math.abs(minmaxY.min)));

        var fieldMin = Math.min(fieldsHoriz,fieldsVert);
        var spacingMin = Math.min(this.vectorsSpacingX, this.vectorsSpacingY);
        var vectorSizeCorrection = (fieldMin*spacingMin)/totalMaxValue;

        canvas_context.strokeStyle = this.vectorsStyle;
        canvas_context.beginPath();

        for(var i=0;i<arrayX.length;i+=this.vectorsSpacingX) 
        {
            for(var j=0;j<arrayX[0].length;j+=this.vectorsSpacingY) 
            {
                var baseXPos = (fieldsHoriz)*i;
                var baseYPos = (fieldsVert)*j;

                canvas_context.moveTo(baseXPos,baseYPos);
                canvas_context.lineTo(baseXPos - arrayX[i][j]*vectorSizeCorrection,baseYPos - arrayY[i][j]*vectorSizeCorrection);
                canvas_context.rect(baseXPos, baseYPos, 1, 1);
            }
        }

        canvas_context.stroke();
        canvas_context.closePath();
    }

    //////////////////////////////////////////////////////////
    this.drawPoints = function(canvas, cells) 
    {
        var cellCanvas_context = canvas.getContext("2d");
        var cWidth = canvas.width;
        var cHeight = canvas.height;

        for(var i=0; i<cells.length; i++) 
        {
            cellCanvas_context.fillRect(cells[i].x, cells[i].y, 2, 2);
        }
    }

    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    // general plot function
    //////////////////////////////////////////////////////////
    this.plot = function() 
    {
        if (this.setColorRange=='predefined') this.calcMinMaxValues = 0; // block minmax calculating
        if (this.calcMinMaxValues==1) this.minmax = this.minMaxValues(this.data);
        if (this.setColorRange=='init') this.calcMinMaxValues = 0; // allow one calculation

        this.clearCanvas(this.canvas);
        if (this.drawColors == 1) this.drawColorsF(this.canvas, this.data);
        if (this.drawValues == 1) this.drawValuesF(this.canvas, this.data);
        if (this.drawVectors == 1) this.drawVectorsF(this.canvas, this.vectorDataX, this.vectorDataY);
    }
    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    //  configuration
    //////////////////////////////////////////////////////////
    ///////// data
    this.canvas;
    this.data;
    this.vectorDataX;
    this.vectorDataY;
    ///////// color config
    this.colorsRamp = this.tellColorArray(); // default color ramp array[] of {r:x;g:y:b:z} values
    this.setColorRange = 0; // default - dynamic, predefined, init
    this.minmax; // narrow color range
    this.colorHighest = this.colorsRamp.length; // max color used
    this.colorLowest = 300; // min color used
    ///////// text config
    this.fontSize = 10;
    this.fontColor = 'rgba(0,0,0,1)';  // r,g,b,alpha , alpha:number from 0 to 1, 0-fully invisible, 1-fully visible
    this.fontStyle = ''; // italic bold
    this.fontFace = 'arial';
    this.roundingCorrection = 1;
    ///////// vectors config
    this.vectorsStyle = 'rgba(0,0,0,0.4)'; // r,g,b,alpha , alpha:number from 0 to 1, 0-fully invisible, 1-fully visible
    this.vectorsSpacingX = 1;
    this.vectorsSpacingY = 1;
    ///////// general config
    this.drawColors=1;
    this.drawValues=0;
    this.drawVectors=0;
    ///////// internal config - must not change
    this.calcMinMaxValues=1;
}
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////

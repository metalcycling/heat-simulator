/*
 * User variables to change the simulation. Change values for your needs.
 */

// Sources to add to the field
let pos_x = [16, 48, 16, 32];
let pos_y = [16, 48, 48, 32];
let intensity = [50, 50, -100, -50];

// Size of the simulation field
let width = 64;
let height = 64;

/*
 * Variables used in the simulation (DO NOT CHANGE)
 */

// Field values
let u_old = zeros(width, height);
let u_new = zeros(width, height);
let sources = [];

// Plotting
let canvas;
let draw;

// Animation
let anim;

/*
 * Utility functions
 */

function zeros(width, height)
{
    data = new Array();

    for (i = 0; i < height; i++)
    {
        data[i] = new Array();

        for (j = 0; j < width; j++)
        {
            data[i][j] = 0;
        }
    }

    return data;
}

/*
 * Simulation functions
 */

document.addEventListener("DOMContentLoaded", function()
{
    createSourcesTable();
});

function createSourcesTable()
{
    /*
     * Given a set of sources with (pox_x, pos_y, intensity) values, we construct a table
     * allowing users to turn the sources on or off during the simulation.
     */
    num_sources = intensity.length;

    table_html = "";

    table_html += "<table id = 'data'>";
    table_html += "<tr>";
    table_html += "<th>X POSITION</th>";
    table_html += "<th>Y POSITION</th>";
    table_html += "<th>INTENSITY</th>";
    table_html += "<th>INCLUDE IN SIMULATION</th>"; 
    table_html += "</tr>";

    for (let i = 0; i < num_sources; i++)
    {
        sources.push("source-" + i);

        table_html += "<tr>";
        table_html += "<td>" + pos_x[i] + "</td>";
        table_html += "<td>" + pos_y[i] + "</td>";
        table_html += "<td>" + intensity[i] + "</td>";

        table_html += "<td>";
        table_html += "<form action = '#'>";
        table_html += "<input type = 'checkbox' id = '" + sources[i] + "' checked>";
        table_html += "</form>";
        table_html += "</td>";

        table_html += "</tr>";
    }

    table_html += "</table>";
    table_html += "</br>";

    document.getElementById("sources-table").innerHTML = table_html;
}

function run()
{
    /*
     * When running the simulation we disable the run button, and enable the stop button.
     */
    document.getElementById("running").disabled = true;
    document.getElementById("stopped").disabled = false;

    /*
     * All simulated results are plotted using a canvas.
     * The library takes care of the plotting so we just need to pass the matrices to be plotted.
     */
    canvas = document.getElementById("simulation");
    draw = new SciDraw();
    draw.canvas = canvas;
    draw.drawColors = 1;
    draw.drawValues = 1;
    draw.drawVectors = 0;

    /*
     * For the physical simulation we need two matrices that represent the evolution in time of the
     * heat field.
     */
    u_old = zeros(width, height);
    u_new = zeros(width, height);

    /*
     * Start simulation with the given speed. Users can change the speed of the simulation using the text box provided.
     * A simulation can be stopped and resumed at will.
     */
    sp = parseInt(document.getElementById("speed").value);
    anim = setInterval(begin, sp);
}

function begin()
{
    /*
     * Set sources using a new array based on the sources that the user selected to be included in the simulation.
     * This array is considered the "old" array since we use this values to calculate the next step in time
     * and save in the the "new" array
     */
    for (i = 0; i < sources.length; i++)
    {
        if (document.getElementById("source-" + i).checked)
        {
            x = parseInt(pos_x[i]);
            y = parseInt(pos_y[i]);
            r = parseInt(intensity[i]);
        
            u_old[x][y] = r;
        }
    }

    /*
     * Propagate heat:
     * The equation used for this simulation is the Laplace equation that calculates the future value of the 
     * grid point being evaluated based on the points next to it.
     * u_new = 1 / 4 * (up_old + down_old + left_old + right_old) 
     */
    for (j = 1; j < height - 1; j++)
    {
        for (i = 1; i < width - 1; i++)
        {
            u_new[i][j] = 0.25 * (u_old[i - 1][j] + u_old[i + 1][j] + u_old[i][j - 1] + u_old[i][j + 1]);
        }
    }

    /*
     * Update the data for the next step in time
     */
    for (j = 1; j < height - 1; j++)
    {
        for (i = 1; i < width - 1; i++)
        {
            u_old[i][j] = u_new[i][j];
        }
    }

    draw.data = u_new;
    draw.plot();
}

function stop()
{
    /*
     * We stop the simulation when the user requires so.
     */
    clearInterval(anim);

    document.getElementById("running").disabled = false;
    document.getElementById("stopped").disabled = true;
}

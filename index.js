var axios = require('axios');

// todo: split file to smaller ones

const temperatureLimit = -10;
const windSpeedLimit = 15;
// todo: add wind direction

// todo: split api by variables (use object)

const latitude = 10,
      longitude = 20,
      pressure = 950,
      altitude = 500,
      timezone = 'EET',
      windSpeedUnit = 'ms';

var config = {
  method: 'get',
  url: `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_${pressure}hPa,windspeed_${pressure}hPa,winddirection_${pressure}hPa,dewpoint_${pressure}hPa,soil_temperature_0cm&timezone=${timezone}&windspeed_unit=${windSpeedUnit}`,
  headers: { }
};

axios(config).then(function (response) {
    canWeFly(response.data.hourly);
})
.catch(function (error) {
  console.log(error);
});

const canFlyCheckmark = {
    true: '✓',
    false: '✗'
};

let weatherUnits = [];

function canWeFly(data) 
{
    console.log(data);
    const currentDate = new Date();
    const time = data['time'];
    console.log(`Today is ${currentDate}`);

    for(let i = 0; i <= time.length; i++)
    {
        // Check only Today, todo: update that for other dates
        const timeUnit = new Date(time[i]);
        const temperature = data[`temperature_${pressure}hPa`][i];
        const windSpeed = data[`windspeed_${pressure}hPa`][i];
        const groundTemp = data[`soil_temperature_0cm`][i];
        const dewPointTemp = data[`dewpoint_${pressure}hPa`][i];
        const cloudBase = calculateCloudBase(groundTemp, dewPointTemp);
        if(timeUnit.getDay() === currentDate.getDay()) 
        {
            const isTemperaturePassed = temperature > temperatureLimit;
            const isWindSpeedPassed = windSpeed < windSpeedLimit;
            const isCloudBasePassed = cloudBase > altitude;
            const formattedTimeUnit = timeUnit.getHours();
            const temperatureObj = {
                temperature: Math.round(temperature),
                temperatureCheckmark: canFlyCheckmark[isTemperaturePassed]
            };
            const windObj = {
                windSpeed: Math.round(windSpeed),
                windCheckmark: canFlyCheckmark[isWindSpeedPassed]
            };
            // skipped for now. calculations are incorrect, e.g.: should be: 300m, actual value: ~1200m
            const cloudBaseObj = { 
                cloudBase: cloudBase,
                cloudBaseCheckmark: canFlyCheckmark[isCloudBasePassed]
            };
            weatherUnits.push(new Weather(
                formattedTimeUnit, 
                temperatureObj, 
                windObj, 
                canFlyCheckmark[isTemperaturePassed && isWindSpeedPassed],
            ));
        }
    }
    // todo: calculate base cloud
    console.table(weatherUnits);
}

function formatJson(data)
{
    var result = Object.entries(data).reduce((result, [key, value]) => {
        result.push(value);
        return result;
    }, []);
    return result.join(' ');
}

function calculateCloudBase(groundTemp, dewPointTemp) 
{ 
    return Math.round((Math.abs(groundTemp - dewPointTemp) / 2.5) * 1000); 
}

function Weather(time, temperature, wind, canFly) 
{
    this.time = time;
    this.temperature = formatJson(temperature);
    this.wind = formatJson(wind);
    this.canFly = canFly;
}
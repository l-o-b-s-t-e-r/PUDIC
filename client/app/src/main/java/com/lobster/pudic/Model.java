package com.lobster.pudic;

import com.google.gson.annotations.SerializedName;

public class Model {

    @SerializedName("temperature")
    private TemperatureWrapper temperature;

    @SerializedName("windows")
    private WindowsWrapper windows;

    @SerializedName("doors")
    private DoorWrapper door;

    @SerializedName("raining")
    private Boolean raining;

    @SerializedName("humidity")
    private Float humidity;

    @SerializedName("rain_tank_level")
    private Integer rainTankLevel;

    public Model() {

    }

    public Model(Float temperatureOutside, Float temperatureInside, Boolean window1State, Boolean window2State, Boolean doorState, Boolean isRaining) {
        temperature = new TemperatureWrapper(temperatureOutside, temperatureInside);
        windows = new WindowsWrapper(window1State, window2State);
        door = new DoorWrapper(doorState);
        raining = isRaining;
        humidity = 80.0f;
        rainTankLevel = 45;
    }

    public Model(Float temperatureOutside, Float temperatureInside, Boolean window1State, Boolean window2State, Boolean doorState, Boolean isRaining, Float humidity, Integer rainTankLevel) {
        temperature = new TemperatureWrapper(temperatureOutside, temperatureInside);
        windows = new WindowsWrapper(window1State, window2State);
        door = new DoorWrapper(doorState);
        raining = isRaining;
        this.humidity = humidity;
        this.rainTankLevel = rainTankLevel;
    }

    public TemperatureWrapper getTemperature() {
        return temperature;
    }

    public void setTemperature(TemperatureWrapper temperature) {
        this.temperature = temperature;
    }

    public WindowsWrapper getWindows() {
        return windows;
    }

    public void setWindows(WindowsWrapper windows) {
        this.windows = windows;
    }

    public DoorWrapper getDoor() {
        return door;
    }

    public void setDoor(DoorWrapper door) {
        this.door = door;
    }

    public Boolean getRaining() {
        return raining;
    }

    public void setRaining(Boolean raining) {
        this.raining = raining;
    }

    public Float getHumidity() {
        return humidity;
    }

    public void setHumidity(Float humidity) {
        this.humidity = humidity;
    }

    public Integer getRainTankLevel() {
        return rainTankLevel;
    }

    public void setRainTankLevel(Integer rainTankLevel) {
        this.rainTankLevel = rainTankLevel;
    }

    public int getImage() {
        if (!windows.getWindow1IsOpened() && !windows.getWindow2IsOpened() && !getDoor().getDoorIsOpened()) {
            return R.drawable.i000;
        } else if (!windows.getWindow1IsOpened() && !windows.getWindow2IsOpened() && getDoor().getDoorIsOpened()) {
            return R.drawable.i001;
        } else if (!windows.getWindow1IsOpened() && windows.getWindow2IsOpened() && !getDoor().getDoorIsOpened()) {
            return R.drawable.i010;
        } else if (!windows.getWindow1IsOpened() && windows.getWindow2IsOpened() && getDoor().getDoorIsOpened()) {
            return R.drawable.i011;
        } else if (windows.getWindow1IsOpened() && !windows.getWindow2IsOpened() && !getDoor().getDoorIsOpened()) {
            return R.drawable.i100;
        } else if (windows.getWindow1IsOpened() && windows.getWindow2IsOpened() && !getDoor().getDoorIsOpened()) {
            return R.drawable.i110;
        } else if (windows.getWindow1IsOpened() && !windows.getWindow2IsOpened() && getDoor().getDoorIsOpened()) {
            return R.drawable.i101;
        } else if (windows.getWindow1IsOpened() && windows.getWindow2IsOpened() && getDoor().getDoorIsOpened()) {
            return R.drawable.i111;
        } else {
            return 0;
        }
    }
}

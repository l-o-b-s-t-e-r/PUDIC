package com.lobster.pudic;

import com.google.gson.annotations.SerializedName;

public class TemperatureWrapper {

    @SerializedName("outside")
    private Float temperatureOutside;

    @SerializedName("inside")
    private RoomTemperature temperatureInside;

    public TemperatureWrapper() {

    }

    public TemperatureWrapper(Float temperatureOutside, Float temperatureInside) {
        this.temperatureOutside = temperatureOutside;
        this.temperatureInside = new RoomTemperature(temperatureInside);
    }

    public Float getTemperatureOutside() {
        return temperatureOutside;
    }

    public void setTemperatureOutside(Float temperatureOutside) {
        this.temperatureOutside = temperatureOutside;
    }

    public RoomTemperature getTemperatureInside() {
        return temperatureInside;
    }

    public void setTemperatureInside(RoomTemperature temperatureInside) {
        this.temperatureInside = temperatureInside;
    }
}

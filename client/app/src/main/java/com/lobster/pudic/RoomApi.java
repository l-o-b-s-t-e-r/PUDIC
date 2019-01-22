package com.lobster.pudic;

import io.reactivex.Completable;
import io.reactivex.Single;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.PUT;

/**
 * Created by Lobster on 27/10/18.
 */
public interface RoomApi {

    @GET("actual_state")
    Single<Model> getModel();

    @PUT("update_model")
    Completable updateModel(@Body Model object);

}

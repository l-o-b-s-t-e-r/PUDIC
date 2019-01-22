package com.lobster.pudic;

import io.reactivex.Completable;
import retrofit2.http.GET;

/**
 * Created by Lobster on 27/10/18.
 */
public interface UpdateApi {

    @GET("update")
    Completable update();
    
}

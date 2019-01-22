package com.lobster.pudic;

import android.app.Activity;
import android.databinding.DataBindingUtil;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.text.method.KeyListener;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.ToggleButton;

import com.lobster.pudic.databinding.ActivityRoomBinding;

import java.util.concurrent.TimeUnit;

import io.reactivex.SingleObserver;
import io.reactivex.android.schedulers.AndroidSchedulers;
import io.reactivex.disposables.Disposable;
import io.reactivex.schedulers.Schedulers;
import okhttp3.OkHttpClient;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.adapter.rxjava2.RxJava2CallAdapterFactory;
import retrofit2.converter.gson.GsonConverterFactory;

public class RoomActivity extends AppCompatActivity {

    private RoomApi roomApi;
    private UpdateApi updateApi;
    private ActivityRoomBinding binding;
    private InputMethodManager imm;
    private KeyListener keyListenerTempOut, keyListenerTempIn, keyListenerHum, keyListenerTank;
    private Boolean flag = false;

    private Model preSet1 = new Model(5.0f, 20.0f, true, false, false, false);
    private Model preSet2 = new Model(16.0f, 20.0f, false, true, false, false);
    private Model preSet3 = new Model(23.0f, 18.0f, false, true, false, true);

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_room);
        binding = DataBindingUtil.setContentView(this, R.layout.activity_room);
        updateApi = providePrivacyRetrofit(provideHttpBuilder(), "http://192.168.43.76:8080/").create(UpdateApi.class);
        roomApi = providePrivacyRetrofit(provideHttpBuilder(), "http://192.168.43.76:8400/").create(RoomApi.class);
        imm = (InputMethodManager) getSystemService(Activity.INPUT_METHOD_SERVICE);

        keyListenerTempOut = binding.outsideTemperatureEditText.getKeyListener();
        keyListenerTempIn = binding.insideTemperatureEditText.getKeyListener();
        keyListenerHum = binding.insideHumidityEditText.getKeyListener();
        keyListenerTank = binding.rainTankEditText.getKeyListener();

        setEditClick(binding.outsideTemperatureEditBtn, binding.outsideTemperatureEditText, keyListenerTempOut);
        setEditClick(binding.insideTemperatureEditBtn, binding.insideTemperatureEditText, keyListenerTempIn);
        setEditClick(binding.insideHumidityEditBtn, binding.insideHumidityEditText, keyListenerHum);
        setEditClick(binding.rainTankEditBtn, binding.rainTankEditText, keyListenerTank);

        binding.set1.setOnClickListener(v -> {
            binding.scroll.scrollTo(0, 0);
            setModel(preSet1);
        });

        binding.set2.setOnClickListener(v -> {
            binding.scroll.scrollTo(0, 0);
            setModel(preSet2);
        });

        binding.set3.setOnClickListener(v -> {
            binding.scroll.scrollTo(0, 0);
            setModel(preSet3);
        });

        binding.update.setOnClickListener(v -> {
            updateApi.update()
                    .andThen(roomApi.getModel())
                    .subscribeOn(Schedulers.io())
                    .observeOn(AndroidSchedulers.mainThread())
                    .subscribe(new SingleObserver<Model>() {
                        @Override
                        public void onSubscribe(Disposable d) {

                        }

                        @Override
                        public void onSuccess(Model model) {
                            showModel(model);
                        }

                        @Override
                        public void onError(Throwable e) {

                        }
                    });
        });

        loadModel();
    }

    private void setToggleClick(ToggleButton btn) {
        btn.setOnClickListener(v -> {
            updateModel();
        });
    }

    private void setEditClick(ImageView btn, EditText editText, KeyListener keyListener) {
        btn.setOnClickListener(v -> {
            if (editText.getKeyListener() == null) {
                editText.setKeyListener(keyListener);
                editText.setSelection(editText.getText().length());
                editText.setBackgroundResource(R.drawable.edit_text_gray_background);
                btn.setImageResource(R.drawable.ic_check_mark_poor);
                imm.toggleSoftInput(InputMethodManager.SHOW_IMPLICIT, 0);
            } else {
                String value = editText.getText().toString().trim();
                if (!value.isEmpty()) {
                    updateModel();
                }
            }
        });
    }

    private void loadModel() {
        roomApi.getModel()
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(new SingleObserver<Model>() {
                    @Override
                    public void onSubscribe(Disposable d) {

                    }

                    @Override
                    public void onSuccess(Model model) {
                        showModel(model);
                    }

                    @Override
                    public void onError(Throwable e) {

                    }
                });
    }

    private void updateModel() {
        Model model = new Model(
                Float.valueOf(binding.outsideTemperatureEditText.getText().toString().trim()),
                Float.valueOf(binding.insideTemperatureEditText.getText().toString().trim()),
                binding.windowFirstBtn.isChecked(),
                binding.windowSecondBtn.isChecked(),
                binding.doorBtn.isChecked(),
                binding.rainBtn.isChecked(),
                Float.valueOf(binding.insideHumidityEditText.getText().toString().trim()),
                Integer.valueOf(binding.rainTankEditText.getText().toString().trim())
        );

        setModel(model);
    }

    private void setModel(Model model) {
        roomApi.updateModel(model)
                .andThen(roomApi.getModel())
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(new SingleObserver<Model>() {
                    @Override
                    public void onSubscribe(Disposable d) {

                    }

                    @Override
                    public void onSuccess(Model model) {
                        showModel(model);
                    }

                    @Override
                    public void onError(Throwable e) {

                    }
                });
    }

    private void showModel(Model model) {
        binding.outsideTemperatureEditText.setText(model.getTemperature().getTemperatureOutside().toString());
        binding.insideTemperatureEditText.setText(model.getTemperature().getTemperatureInside().getTemperature().toString());
        binding.windowFirstBtn.setChecked(model.getWindows().getWindow1IsOpened());
        binding.windowSecondBtn.setChecked(model.getWindows().getWindow2IsOpened());
        binding.doorBtn.setChecked(model.getDoor().getDoorIsOpened());
        binding.rainBtn.setChecked(model.getRaining().booleanValue());
        binding.insideHumidityEditText.setText(model.getHumidity().toString());
        binding.rainTankEditText.setText(model.getRainTankLevel().toString());
        binding.roomImage.setImageResource(model.getImage());

        disableEditTeamName(binding.outsideTemperatureEditText, binding.outsideTemperatureEditBtn);
        disableEditTeamName(binding.insideTemperatureEditText, binding.insideTemperatureEditBtn);
        disableEditTeamName(binding.rainTankEditText, binding.rainTankEditBtn);
        disableEditTeamName(binding.insideHumidityEditText, binding.insideHumidityEditBtn);

        if (!flag) {
            flag = true;
            setToggleClick(binding.windowFirstBtn);
            setToggleClick(binding.windowSecondBtn);
            setToggleClick(binding.doorBtn);
            setToggleClick(binding.rainBtn);
        }

        if (imm.isAcceptingText()) {
            imm.toggleSoftInput(InputMethodManager.HIDE_IMPLICIT_ONLY, 0);
        }
    }

    public void disableEditTeamName(EditText editText, ImageView btn) {
        editText.setKeyListener(null);
        editText.setBackgroundResource(R.drawable.edit_text_underline_background);
        btn.setImageResource(R.drawable.ic_edit);
    }

    public OkHttpClient provideHttpBuilder() {
        HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
        logging.setLevel(HttpLoggingInterceptor.Level.BODY);

        return new OkHttpClient.Builder()
                .addInterceptor(logging)
                .connectTimeout(180, TimeUnit.SECONDS)
                .writeTimeout(180, TimeUnit.SECONDS)
                .readTimeout(180, TimeUnit.SECONDS)
                .build();
    }

    public Retrofit providePrivacyRetrofit(OkHttpClient client, String url) {
        return new Retrofit.Builder()
                .addConverterFactory(GsonConverterFactory.create())
                .addCallAdapterFactory(RxJava2CallAdapterFactory.create())
                .client(client)
                .baseUrl(url)
                .build();
    }
}

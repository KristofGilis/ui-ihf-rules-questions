plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "io.github.kristofgilis.ihfrulesquiz"
    compileSdk = 36
    buildToolsVersion = "36.0.0"

    defaultConfig {
        applicationId = "io.github.kristofgilis.ihfrulesquiz"
        minSdk = 24
        targetSdk = 36
        versionCode = providers.gradleProperty("androidVersionCode").orElse("1").get().toInt().also {
            require(it in 1..2_100_000_000) { "androidVersionCode must be between 1 and 2100000000" }
        }
        versionName = "1.0"
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    val releaseKeystore = providers.environmentVariable("ANDROID_KEYSTORE_PATH").orNull
    if (!releaseKeystore.isNullOrBlank()) {
        signingConfigs {
            create("release") {
                storeFile = file(releaseKeystore)
                storePassword = providers.environmentVariable("ANDROID_KEYSTORE_PASSWORD").get()
                keyAlias = providers.environmentVariable("ANDROID_KEY_ALIAS").get()
                keyPassword = providers.environmentVariable("ANDROID_KEY_PASSWORD").get()
            }
        }
        buildTypes.getByName("release").signingConfig = signingConfigs.getByName("release")
    }

    packaging {
        resources.excludes += "/META-INF/{AL2.0,LGPL2.1}"
    }
}

kotlin {
    jvmToolchain(17)
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.material.icons)
    debugImplementation(libs.androidx.compose.ui.tooling)
}

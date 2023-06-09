﻿using Flurl.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace mobile.Model.Generic
{
    public static class ApiHandlers
    {
        public static JObject GetAuthDataFromPreferences()
        {
            var dataAsString = Preferences.Get(Config.PREFERENCES_NAME, "");
            if (string.IsNullOrEmpty(dataAsString))
                return null;
            return JObject.Parse(dataAsString);
        }
        public static void SaveUserDataToPreferences(string data)
        {
            Preferences.Set(Config.PREFERENCES_NAME, data);
        }
        public static async Task<JObject> Refresh()
        {
            try
            {
                var userData = GetAuthDataFromPreferences();
                if (userData == null)
                    throw new Exception("Not authorized");
                var link = $"{Config.BASE_URL}/api/refresh";
                var refreshToken = userData["refreshToken"].ToString();
                var responce = await link.WithCookie("refreshToken", refreshToken).PostAsync();
                var content = await responce.ResponseMessage.Content.ReadAsStringAsync();
                var jsonObject = JObject.Parse(content);

                SaveUserDataToPreferences(content);

                return AddStatusCodeToJObject(jsonObject, 200);
            }
            catch (Exception ex)
            {
                return ReturnException(ex);
            }

        }

        static async Task<JObject> GetData()
        {
            try
            {
                var link = $"{Config.BASE_URL}/api";
                var accessToken = GetAuthDataFromPreferences()["accessToken"].ToString();
                var responce = await link.WithHeader("authorization", "Bearer " + accessToken).GetAsync();
                var content = await responce.ResponseMessage.Content.ReadAsStringAsync();
                var jsonObject = JObject.Parse(content);

                jsonObject = AddStatusCodeToJObject(jsonObject, 200);
                return jsonObject;
            }
            catch (Exception ex)
            {
                return ReturnException(ex);
            }
        }
        public static async Task<JObject> GetUserData()
        {
            try
            {
                var result = await RefreshInterceptor(GetData);

                return result;
            }
            catch (Exception ex)
            {
                return ReturnException(ex);
            }
        }
        public static async Task<JObject> Logout()
        {
            try
            {
                var callback = async () =>
                {
                    var link = $"{Config.BASE_URL}/api/logout";
                    var userData = GetAuthDataFromPreferences();
                    var refreshToken = userData["refreshToken"].ToString();
                    var responce = await link.WithCookie("refreshToken", refreshToken).PostAsync();
                    var content = await responce.ResponseMessage.Content.ReadAsStringAsync();
                    var jsonObject = JObject.Parse(content);

                    jsonObject = AddStatusCodeToJObject(jsonObject, 200);
                    return jsonObject;
                };
                var result = await RefreshInterceptor(callback);
                return result;
            }
            catch (Exception ex)
            {
                return ReturnException(ex);
            }
        }
        public static async Task<JObject> RefreshInterceptor(Func<Task<JObject>> callback)
        {
            try
            {
                var response = await callback();
                var content = response.ToString();

                if ((int)response["StatusCode"] != 200)
                {
                    var refreshResult = await Refresh();
                    if ((int)refreshResult["StatusCode"] != 200)
                        throw new Exception("Not authorized");

                    response = await callback();
                }

                return response;
            }
            catch (Exception ex)
            {
                return ReturnException(ex);
            }
        }
        public static JObject ReturnException(Exception exception, int code = 400)
        {
            JsonSerializerSettings settings = new JsonSerializerSettings
            {
                ReferenceLoopHandling = ReferenceLoopHandling.Ignore
            };
            var res = JObject.FromObject(exception, JsonSerializer.Create(settings));
            return AddStatusCodeToJObject(res, code);
        }
        public static JObject AddStatusCodeToJObject(JObject obj, int statusCode)
        {
            if (obj["StatusCode"] == null)
                obj.Add("StatusCode", statusCode);
            return obj;
        }
        public static void RewriteCollection(ICollection<object> newCollection, ICollection<object> oldCollection)
        {
            oldCollection.Clear();
            foreach (var item in newCollection)
            {
                if (item != null)
                    oldCollection.Add(item);
            }
        }
    }
}
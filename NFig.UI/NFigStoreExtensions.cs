using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;

namespace NFig.UI
{
    public static class NFigStoreExtensions
    {
        // Thank you Mr. Rogers
        // https://stackoverflow.com/questions/24143149/keep-casing-when-serializing-dictionaries/24226442#24226442
        class CamelCaseExceptDictionaryKeysResolver : CamelCasePropertyNamesContractResolver
        {
            protected override JsonDictionaryContract CreateDictionaryContract(Type objectType)
            {
                var contract = base.CreateDictionaryContract(objectType);
                contract.DictionaryKeyResolver = propertyName => propertyName;
                return contract;
            }
        }

        static readonly JsonSerializerSettings s_jsonSettings = new JsonSerializerSettings
        {
            DateFormatHandling = DateFormatHandling.IsoDateFormat,
            NullValueHandling = NullValueHandling.Ignore,
            DateTimeZoneHandling = DateTimeZoneHandling.Utc,
            ContractResolver = new CamelCaseExceptDictionaryKeysResolver(),
            Converters =
            {
                new StringEnumConverter()
            }
        };

        public static string GetSettingsJson<TSettings, TTier, TDataCenter>(
          this NFigStore<TSettings, TTier, TDataCenter> store,
          string applicationName,
          TTier currentTier,
          TDataCenter currentDataCenter,
          IList<TDataCenter> availableDataCenters)
          where TTier : struct
          where TDataCenter : struct
          where TSettings : class, INFigSettings<TTier, TDataCenter>, new()
        {
            if (store == null) throw new ArgumentNullException(nameof(store));

            var infos = store.GetAllSettingInfos(applicationName);
            var model = new SettingsJsonModel<TTier, TDataCenter>(
                currentTier,
                currentDataCenter,
                infos,
                availableDataCenters
            );

            return JsonConvert.SerializeObject(model, s_jsonSettings);
        }


        public static async Task<string> GetSettingsJsonAsync
          <TSettings, TTier, TDataCenter>(
            this NFigAsyncStore<TSettings, TTier, TDataCenter> store,
            string applicationName,
            TTier currentTier,
            TDataCenter currentDataCenter,
            IList<TDataCenter> availableDataCenters)
          where TTier : struct
          where TDataCenter : struct
          where TSettings : class, INFigSettings<TTier, TDataCenter>, new()
        {
            if (store == null) throw new ArgumentNullException(nameof(store));

            var infos = await store.GetAllSettingInfosAsync(applicationName);
            var model = new SettingsJsonModel<TTier, TDataCenter>(
                currentTier,
                currentDataCenter,
                infos,
                availableDataCenters
            );

            return JsonConvert.SerializeObject(model, s_jsonSettings);
        }


        public static string GetSettingJson<TSettings, TTier, TDataCenter>(
          this NFigStore<TSettings, TTier, TDataCenter> store,
          string applicationName,
          string settingName,
          TTier tier,
          TDataCenter dataCenter,
          IList<TDataCenter> availableDataCenters)
          where TTier : struct
          where TDataCenter : struct
          where TSettings : class, INFigSettings<TTier, TDataCenter>, new()
        {
            var model = new SettingsJsonModel<TTier, TDataCenter>.Setting(
                tier,
                dataCenter,
                store.GetSettingInfo(applicationName, settingName),
                availableDataCenters
            );
            return JsonConvert.SerializeObject(model, s_jsonSettings);
        }


        public static async Task<string> GetSettingJsonAsync
          <TSettings, TTier, TDataCenter>(
            this NFigAsyncStore<TSettings, TTier, TDataCenter> store,
            string applicationName,
            string settingName,
            TTier tier,
            TDataCenter dataCenter,
            IList<TDataCenter> availableDataCenters)
          where TTier : struct
          where TDataCenter : struct
          where TSettings : class, INFigSettings<TTier, TDataCenter>, new()
        {
            var model = new SettingsJsonModel<TTier, TDataCenter>.Setting(
                tier,
                dataCenter,
                await store.GetSettingInfoAsync(applicationName, settingName),
                availableDataCenters
            );

            return JsonConvert.SerializeObject(model, s_jsonSettings);
        }
    }
}
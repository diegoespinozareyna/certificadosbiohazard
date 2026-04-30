'use client';

import { useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import moment from 'moment-timezone';

const TZ = 'America/Lima';

const SERVICIOS_OPCIONES = [
  'Desinsectación',
  'Desratización',
  'Desinfección',
  'Limpieza y desinfección de reservorios de agua',
  'Limpieza de trampa de grasa',
];

// Convierte cualquier fecha (ISO completo o YYYY-MM-DD) al formato del
// <input type="date"> (YYYY-MM-DD) interpretándola en zona Lima.
function toDateInput(value) {
  if (!value) return '';
  const m = moment.tz(value, TZ);
  if (!m.isValid()) return '';
  return m.format('YYYY-MM-DD');
}

// Suma 6 meses respetando los días del calendario (29 ene + 6m = 29 jul, etc.)
function addSixMonths(dateString) {
  if (!dateString) return '';
  const m = moment.tz(dateString, TZ);
  if (!m.isValid()) return '';
  return m.add(6, 'months').format('YYYY-MM-DD');
}

function buildDefaults(data = {}) {
  return {
    ruc: data.ruc || '',
    cliente: data.cliente || '',
    servicios: Array.isArray(data.servicios) ? data.servicios : [],
    ubicacion: data.ubicacion || '',
    giro: data.giro || '',
    areaTratada: data.areaTratada ?? '',
    fechaServicio: toDateInput(data.fechaServicio),
    fechaEmision: toDateInput(data.fechaEmision),
    fechaVencimiento: toDateInput(data.fechaVencimiento),
  };
}

const inputBase =
  'w-full rounded-xl border border-mist-300 bg-mist-100 px-4 py-2.5 text-aqua-900 placeholder:text-aqua-800/40 outline-none transition-all focus:border-aqua-400 focus:bg-white focus:ring-4 focus:ring-aqua-200/60';

const autocompleteSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#f3f8f7',
    borderRadius: '12px',
    fontFamily: 'inherit',
    transition: 'all 200ms',
    '& fieldset': { borderColor: '#e8f0ee' },
    '&:hover fieldset': { borderColor: '#9bdcc8' },
    '&.Mui-focused fieldset': {
      borderColor: '#6fc8ad',
      borderWidth: '1px',
    },
    '&.Mui-focused': {
      backgroundColor: 'white',
      boxShadow: '0 0 0 4px rgba(155, 220, 200, 0.6)',
    },
  },
  '& .MuiAutocomplete-input::placeholder': {
    color: 'rgba(42, 58, 55, 0.4)',
    opacity: 1,
  },
};

export default function TareaForm({
  initialData = {},
  onSubmit: onSubmitProp,
  submitLabel = 'Guardar',
}) {
  const esEdicion = !!initialData?._id;

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onTouched',
    defaultValues: buildDefaults(initialData),
  });

  // Si cambia el id de initialData (editar otro registro) → reset.
  useEffect(() => {
    if (initialData?._id) {
      reset(buildDefaults(initialData));
    }
  }, [initialData?._id, reset]);

  // Auto: fechaVencimiento = fechaEmision + 6 meses (solo en cambios del usuario).
  const fechaEmision = watch('fechaEmision');
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (!fechaEmision) return;
    const calculado = addSixMonths(fechaEmision);
    if (calculado && calculado !== getValues('fechaVencimiento')) {
      setValue('fechaVencimiento', calculado, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [fechaEmision, setValue, getValues]);

  const onSubmit = async (data) => {
    clearErrors('root');
    try {
      await onSubmitProp({
        ruc: data.ruc.trim(),
        cliente: data.cliente.trim(),
        servicios: data.servicios || [],
        ubicacion: data.ubicacion?.trim() || '',
        giro: data.giro?.trim() || '',
        areaTratada: data.areaTratada === '' || data.areaTratada == null
          ? null
          : Number(data.areaTratada),
        fechaServicio: data.fechaServicio || null,
        fechaEmision: data.fechaEmision || null,
        fechaVencimiento: data.fechaVencimiento || null,
      });
    } catch (err) {
      setError('root.serverError', { type: 'manual', message: err.message });
    }
  };

  const errorClass = 'text-red-600 text-xs';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-aqua-800 flex items-center gap-2">
            RUC
            {esEdicion && (
              <span className="text-[10px] uppercase tracking-wider text-aqua-700/70 font-normal bg-mist-300 px-1.5 py-0.5 rounded">
                No editable
              </span>
            )}
          </span>
          <input
            type="text"
            inputMode="numeric"
            readOnly={esEdicion}
            tabIndex={esEdicion ? -1 : 0}
            aria-readonly={esEdicion}
            className={`${inputBase} font-mono tracking-wide ${
              esEdicion
                ? 'bg-mist-300 text-aqua-800/70 cursor-not-allowed focus:ring-0 focus:border-mist-300 focus:bg-mist-300'
                : ''
            }`}
            placeholder="20123456789"
            {...register('ruc', {
              required: 'El RUC es obligatorio',
              setValueAs: (v) => (v ?? '').replace(/\s+/g, ''),
            })}
          />
          {esEdicion && (
            <span className="text-xs text-aqua-800/55">
              El RUC no se puede modificar después de creado el certificado.
            </span>
          )}
          {errors.ruc && (
            <span className={errorClass}>{errors.ruc.message}</span>
          )}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-aqua-800">Cliente</span>
          <input
            type="text"
            className={inputBase}
            placeholder="Razón social del cliente"
            {...register('cliente', { required: 'El cliente es obligatorio' })}
          />
          {errors.cliente && (
            <span className={errorClass}>{errors.cliente.message}</span>
          )}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-aqua-800">Giro</span>
          <input
            type="text"
            className={inputBase}
            placeholder="Ej. Restaurante, oficina, almacén…"
            {...register('giro')}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-aqua-800">Ubicación</span>
          <input
            type="text"
            className={inputBase}
            placeholder="Dirección o sede"
            {...register('ubicacion')}
          />
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-sm font-medium text-aqua-800 flex items-center gap-2">
            Área tratada
            <span className="text-[10px] uppercase tracking-wider text-aqua-700/70 font-normal bg-aqua-100 px-1.5 py-0.5 rounded">
              m²
            </span>
          </span>
          <input
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            className={inputBase}
            placeholder="120"
            {...register('areaTratada', {
              validate: (v) => {
                if (v === '' || v == null) return true;
                const num = Number(v);
                if (Number.isNaN(num)) return 'Debe ser un número';
                if (num <= 0) return 'Debe ser mayor a 0';
                return true;
              },
            })}
          />
          {errors.areaTratada && (
            <span className={errorClass}>{errors.areaTratada.message}</span>
          )}
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-aqua-800">Servicios</span>
        <Controller
          name="servicios"
          control={control}
          render={({ field: { onChange, value, onBlur, ref } }) => (
            <Autocomplete
              multiple
              disableCloseOnSelect
              size="small"
              options={SERVICIOS_OPCIONES}
              value={value || []}
              isOptionEqualToValue={(option, val) => option === val}
              onBlur={onBlur}
              onChange={(_, newValue) => {
                onChange([...new Set(newValue)]);
              }}
              renderValue={(value, getItemProps) =>
                value.map((option, index) => {
                  const { key, ...itemProps } = getItemProps({ index });
                  return (
                    <Chip
                      key={key}
                      label={option}
                      size="small"
                      {...itemProps}
                      sx={{
                        backgroundColor: '#dff5ee',
                        color: '#265f50',
                        fontFamily: 'inherit',
                        '& .MuiChip-deleteIcon': {
                          color: '#399a7c',
                          '&:hover': { color: '#1c4940' },
                        },
                      }}
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputRef={ref}
                  placeholder={
                    value?.length ? '' : 'Selecciona uno o más servicios…'
                  }
                />
              )}
              sx={autocompleteSx}
            />
          )}
        />
        <span className="text-xs text-aqua-800/55">
          Selecciona de la lista (puedes elegir varios).
        </span>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-aqua-800">
            Fecha de servicio
          </span>
          <input type="date" className={inputBase} {...register('fechaServicio')} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-aqua-800">
            Fecha de emisión
          </span>
          <input type="date" className={inputBase} {...register('fechaEmision')} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-aqua-800 flex items-center gap-2">
            Fecha de vencimiento
            <span className="text-[10px] uppercase tracking-wider text-aqua-700/70 font-normal bg-aqua-100 px-1.5 py-0.5 rounded">
              auto +6 meses
            </span>
          </span>
          <input
            type="date"
            className={inputBase}
            {...register('fechaVencimiento')}
          />
        </label>
      </div>

      {errors.root?.serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {errors.root.serverError.message}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-aqua-500 text-white font-medium rounded-full px-6 py-2.5 hover:bg-aqua-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-soft"
        >
          {isSubmitting ? 'Guardando…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
